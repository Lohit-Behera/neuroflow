import React, { useState, useEffect, memo, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import { startWorkflow, handleCancel } from "@/lib/execute/executeWorkflow";
import { TextShimmer } from "@/components/ui/text-shimmer";
import Image from "next/image";
import { BorderTrail } from "@/components/ui/border-trail";

// Create a memoized version of the title component
const ProcessingTitle = memo(({ processing }: { processing: boolean }) => {
  if (processing) {
    return (
      <TextShimmer className="font-mono" duration={2}>
        Processing...
      </TextShimmer>
    );
  }
  return <span>Completed</span>;
});

// Assign display name for better debugging
ProcessingTitle.displayName = "ProcessingTitle";

const StartNode: React.FC<NodeProps> = ({ id, isConnectable }) => {
  const dispatch = useAppDispatch();

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const edges = useAppSelector((state) => state.flow.edges);
  const nodes = useAppSelector((state) => state.flow.nodes);
  const nodeData = useAppSelector((state) => state.flow.nodeData);
  const ollamaBaseUrl = useAppSelector((state) => state.base.ollama.baseUrl);
  const sdforgeBaseUrl = useAppSelector((state) => state.base.sdforge.baseUrl);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [streamingOutput, setStreamingOutput] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (scrollAreaRef.current) {
      // Find the scrollable container inside the ScrollArea component
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        // Use requestAnimationFrame to ensure the scroll happens after render
        requestAnimationFrame(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        });
      }
    }
  }, [streamingOutput, currentImage, finalImage]);

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

  const handleCancelGeneration = () => {
    handleCancel(sdforgeBaseUrl, setCanceled, setIsGenerating);
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
    await startWorkflow({
      startNodeId: id,
      nodes,
      edges,
      nodeData,
      ollamaBaseUrl,
      sdforgeBaseUrl,
      dispatch,
      setStreamingOutput,
      setDialogOpen,
      setFinalImage,
      setCurrentImage,
      setProgress,
      setCanceled,
      setIsGenerating,
      setProcessing,
    });
  };

  return (
    <div className="p-4 bg-muted shadow-lg rounded-lg border min-w-[250px]">
      <h3 className="text-sm md:text-lg text-center font-semibold mb-2">
        Start Workflow
      </h3>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <h4 className=" mb-2">Start the workflow Manually</h4>
          <Button
            className="w-full"
            onClick={handleStart}
            disabled={processing}
          >
            <Play className="w-4 h-4" />
            {processing ? "Running..." : "Start"}
          </Button>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: "16px",
          height: "16px",
          background: "#6d28d9",
        }}
        isConnectable={isConnectable}
      />

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] min-h-56 overflow-hidden"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          {processing && (
            <BorderTrail
              style={{
                background:
                  "linear-gradient(to left, #7f43de, #6d28d9, #7f43de)",
              }}
              size={150}
            />
          )}
          <DialogHeader>
            <DialogTitle>
              <ProcessingTitle processing={processing} />
            </DialogTitle>
          </DialogHeader>
          <ScrollArea
            className="max-h-[75vh] overflow-y-auto"
            ref={scrollAreaRef}
          >
            <div className="space-y-6 pr-2">
              {/* Split output by node type for better organization */}
              {parseStreamingOutput(streamingOutput).map((section, index) => (
                <div key={index} className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-2">
                    {section.title}
                  </h3>
                  <pre className="text-sm whitespace-pre-wrap">
                    {section.content}
                  </pre>

                  {/* Show image after its related SD Forge node output */}
                  {section.nodeType === "SDForge" &&
                    (currentImage || finalImage) && (
                      <div className="mt-4 flex flex-col items-center space-y-4">
                        <Image
                          src={
                            finalImage?.toString() ||
                            (currentImage?.toString() as string)
                          }
                          width={512}
                          height={512}
                          alt="Generated"
                          className="rounded-lg shadow-lg max-w-full"
                        />

                        {isGenerating && (
                          <Button
                            variant="destructive"
                            onClick={handleCancelGeneration}
                          >
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
              ))}

              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center">{progress}%</p>
                </div>
              )}

              {streamingOutput.includes("🚀 Execution Complete!") && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-8">
                  <p className="text-center font-medium text-green-700 dark:text-green-300">
                    🚀 Workflow Execution Complete!
                  </p>
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

function parseStreamingOutput(output: string) {
  if (!output) return [];

  const sections: Array<{
    title: string;
    content: string;
    nodeType: "Ollama" | "SDForge" | "Other";
  }> = [];

  // Split by node execution markers
  const nodeOutputs = output.split(/\nExecuting (Ollama|SDForge) Node: /);

  // First item might be empty or contain initial output
  if (nodeOutputs[0].trim()) {
    sections.push({
      title: "Initialization",
      content: nodeOutputs[0].trim(),
      nodeType: "Other",
    });
  }

  // Process node outputs
  for (let i = 1; i < nodeOutputs.length; i += 2) {
    const nodeType = nodeOutputs[i] as "Ollama" | "SDForge";
    const content = nodeOutputs[i + 1] || "";

    // Extract node ID from the content (assuming it starts with the node ID)
    const idMatch = content.match(/^([a-zA-Z0-9-_]+)/);
    const nodeId = idMatch ? idMatch[1] : "unknown";

    // Remove the completion message if it's in this section
    const cleanContent = content.replace(/\n\n🚀 Execution Complete!/g, "");

    sections.push({
      title: `${nodeType} Node: ${nodeId}`,
      content: cleanContent.trim(),
      nodeType: nodeType,
    });
  }

  return sections;
}
