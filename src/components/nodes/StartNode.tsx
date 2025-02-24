import React, { useState, useEffect, memo } from "react";
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
        className="w-3 h-3 bg-gray-700 rounded-full"
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
          <ScrollArea className="max-h-[75vh] overflow-y-auto">
            <div className="space-y-4 pr-2">
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
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartNode;
