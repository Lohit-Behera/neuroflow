import React, { useState, useEffect } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Play, Download, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateNodeData } from "@/lib/features/flowSlice";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "../ui/scroll-area";

const StartNode: React.FC<NodeProps> = ({ id, isConnectable }) => {
  const dispatch = useAppDispatch();
  const edges = useAppSelector((state) => state.flow.edges);
  const nodes = useAppSelector((state) => state.flow.nodes);
  const nodeData = useAppSelector((state) => state.flow.nodeData);
  const ollamaBaseUrl = useAppSelector((state) => state.base.ollama.baseUrl);
  const sdforgeBaseUrl = useAppSelector((state) => state.base.sdforge.baseUrl);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [streamingOutput, setStreamingOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;

    const checkProgress = async () => {
      try {
        const response = await fetch(`${sdforgeBaseUrl}/sdapi/v1/progress`);
        const data = await response.json();
        const currentProgress = Math.round(data.progress * 100);

        if (canceled || currentProgress === 100) {
          setIsGenerating(false);
          if (progressInterval) {
            clearInterval(progressInterval);
          }
          return;
        }

        setProgress(currentProgress);

        if (data.current_image) {
          setCurrentImage(`data:image/png;base64,${data.current_image}`);
        }
      } catch (error) {
        console.error("Error checking progress:", error);
        setIsGenerating(false);
        if (progressInterval) {
          clearInterval(progressInterval);
        }
      }
    };

    if (isGenerating && !canceled) {
      progressInterval = setInterval(checkProgress, 1000);
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [isGenerating, canceled, sdforgeBaseUrl]);

  const executeOllamaNode = async (nodeId: string, input: string = "") => {
    const targetNode = nodeData[nodeId];
    if (!targetNode) {
      toast.warning(`Node ${nodeId} not found!`);
      return;
    }

    const { model, instructions, prompt } = targetNode;
    setStreamingOutput(
      (prev) => `${prev}\nExecuting Ollama Node: ${nodeId}...\n`
    );

    try {
      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input || prompt,
          instructions,
          model,
          baseUrl: ollamaBaseUrl,
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullResponse += chunk;
        setStreamingOutput((prev) => prev + chunk);
      }

      dispatch(
        updateNodeData({ id: nodeId, data: { output: fullResponse } } as any)
      );

      return fullResponse;
    } catch (error: any) {
      const errorMessage = `Error in Ollama Node ${nodeId}: ${error.message}`;
      setStreamingOutput((prev) => prev + "\n" + errorMessage);
      throw new Error(errorMessage);
    }
  };

  const executeSDForgeNode = async (nodeId: string, input: string = "") => {
    const targetNode = nodeData[nodeId];
    if (!targetNode) {
      toast.warning(`Node ${nodeId} not found!`);
      return;
    }

    setProgress(0);
    setCurrentImage(null);
    setFinalImage(null);
    setCanceled(false);
    setIsGenerating(true);

    const {
      imagePrompt,
      width,
      height,
      samplingSteps,
      samplingMethod,
      guidanceScale,
      schedulerType,
    } = targetNode;

    setStreamingOutput(
      (prev) => `${prev}\nExecuting SDForge Node: ${nodeId}...\n`
    );

    try {
      const prompt = input || imagePrompt;
      const res = await fetch(`${sdforgeBaseUrl}/sdapi/v1/txt2img`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          width,
          height,
          steps: samplingSteps,
          sampler_name: samplingMethod,
          cfg_scale: guidanceScale,
          scheduler: schedulerType,
          seed: Math.floor(Math.random() * 1000000000),
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const imageData = data.images[0];
      const finalImageUrl = `data:image/png;base64,${imageData}`;

      setFinalImage(finalImageUrl);
      setProgress(100);
      setIsGenerating(false);

      dispatch(
        updateNodeData({
          id: nodeId,
          data: {
            output: imageData,
            outputType: "image",
          },
        } as any)
      );

      setStreamingOutput((prev) => `${prev}\nImage generated successfully!\n`);
      return imageData;
    } catch (error: any) {
      setIsGenerating(false);
      const errorMessage = `Error in SDForge Node ${nodeId}: ${error.message}`;
      setStreamingOutput((prev) => prev + "\n" + errorMessage);
      throw new Error(errorMessage);
    }
  };

  const executeNode = async (nodeId: string, input: string = "") => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) {
      toast.warning(`Node ${nodeId} not found in nodes list!`);
      return;
    }

    try {
      let output;
      if (node.type === "ollamaNode") {
        output = await executeOllamaNode(nodeId, input);
      } else if (node.type === "sdForgeNode") {
        output = await executeSDForgeNode(nodeId, input);
      } else {
        throw new Error(`Unknown node type: ${node.type}`);
      }

      const nextEdge = edges.find((edge) => edge.source === nodeId);
      if (nextEdge) {
        await executeNode(nextEdge.target, output);
      } else {
        setStreamingOutput((prev) => prev + "\n\n🚀 Execution Complete!");
      }
    } catch (error: any) {
      setStreamingOutput((prev) => prev + "\n" + error.message);
    }
  };

  const handleCancel = async () => {
    try {
      await fetch(`${sdforgeBaseUrl}/sdapi/v1/interrupt`, {
        method: "POST",
      });
      setCanceled(true);
      setIsGenerating(false);
      setLoading(false);
      toast.success("Generation canceled");
    } catch (error) {
      toast.error("Failed to cancel generation");
    }
  };

  const handleDownload = () => {
    if (finalImage) {
      const link = document.createElement("a");
      link.href = finalImage;
      link.download = "generated_image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setStreamingOutput("");
    setDialogOpen(true);
    setFinalImage(null);
    setStreamingOutput("");
    setCurrentImage(null);

    const firstEdge = edges.find((edge) => edge.source === id);
    if (!firstEdge) {
      toast.warning("No nodes connected to Start Node!");
      setLoading(false);
      return;
    }

    try {
      await executeNode(firstEdge.target);
    } catch (error: any) {
      toast.error(`Workflow execution failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-muted shadow-lg rounded-lg border">
      <div className="text-sm font-semibold mb-2">Start Flow</div>
      <Button className="w-full" onClick={handleStart} disabled={loading}>
        <Play className="w-4 h-4 mr-2" />
        {loading ? "Running..." : "Start"}
      </Button>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-700 rounded-full"
        isConnectable={isConnectable}
      />

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Processing Workflow</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[75vh] overflow-y-auto">
            <div className="space-y-4">
              <pre className="text-sm whitespace-pre-wrap">
                {streamingOutput}
              </pre>

              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center">{progress}%</p>
                </div>
              )}

              {(currentImage || finalImage) && (
                <div className="flex flex-col items-center space-y-4">
                  <img
                    src={finalImage || currentImage}
                    alt="Generated"
                    className="rounded-lg shadow-lg max-w-full"
                  />

                  {isGenerating && (
                    <Button variant="destructive" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel Generation
                    </Button>
                  )}

                  {finalImage && !isGenerating && (
                    <Button onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Image
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartNode;
