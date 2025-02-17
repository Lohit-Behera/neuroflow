import { toast } from "sonner";
import { executeOllamaNode } from "./executeOllamaNode";
import { executeSDForgeNode } from "./executeSDForgeNode";
import { AppDispatch } from "@/lib/store";
import { Node, Edge } from "@xyflow/react";

interface ExecuteNodeParams {
  nodeId: string;
  input?: string;
  nodes: Node[];
  edges: Edge[];
  nodeData: Record<string, any>;
  ollamaBaseUrl: string;
  sdforgeBaseUrl: string;
  dispatch: AppDispatch;
  updateStreamingOutput: (output: string) => void;
  setProgress: (progress: number) => void;
  setCurrentImage: (image: string | null) => void;
  setFinalImage: (image: string | null) => void;
  setCanceled: (canceled: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setProcessing: (completed: boolean) => void;
}

export const executeNode = async ({
  nodeId,
  input = "",
  nodes,
  edges,
  nodeData,
  ollamaBaseUrl,
  sdforgeBaseUrl,
  dispatch,
  updateStreamingOutput,
  setProgress,
  setCurrentImage,
  setFinalImage,
  setCanceled,
  setIsGenerating,
  setProcessing,
}: ExecuteNodeParams): Promise<void> => {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) {
    toast.warning(`Node ${nodeId} not found in nodes list!`);
    return;
  }

  try {
    let output;
    if (node.type === "ollamaNode") {
      output = await executeOllamaNode({
        nodeId,
        input,
        nodeData,
        ollamaBaseUrl,
        dispatch,
        updateStreamingOutput,
      });
    } else if (node.type === "sdForgeNode") {
      output = await executeSDForgeNode({
        nodeId,
        input,
        nodeData,
        sdforgeBaseUrl,
        dispatch,
        updateStreamingOutput,
        setProgress,
        setCurrentImage,
        setFinalImage,
        setCanceled,
        setIsGenerating,
      });
    } else {
      throw new Error(`Unknown node type: ${node.type}`);
    }

    const nextEdge = edges.find((edge) => edge.source === nodeId);
    if (nextEdge) {
      await executeNode({
        nodeId: nextEdge.target,
        input: output,
        nodes,
        edges,
        nodeData,
        ollamaBaseUrl,
        sdforgeBaseUrl,
        dispatch,
        updateStreamingOutput,
        setProgress,
        setCurrentImage,
        setFinalImage,
        setCanceled,
        setIsGenerating,
        setProcessing,
      });
    } else {
      updateStreamingOutput("\n\n🚀 Execution Complete!");
      setProcessing(false);
    }
  } catch (error: any) {
    updateStreamingOutput("\n" + error.message);
  }
};

export const handleCancel = async (
  sdforgeBaseUrl: string,
  setCanceled: (canceled: boolean) => void,
  setIsGenerating: (isGenerating: boolean) => void,
  setLoading: (loading: boolean) => void
): Promise<void> => {
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

// Helper function to create a proper setStreamingOutput function
export const createStreamingOutputSetter = (
  setStreamingOutput: React.Dispatch<React.SetStateAction<string>>
): ((text: string) => void) => {
  return (text: string) => {
    setStreamingOutput((prev) => prev + text);
  };
};

export const startWorkflow = async ({
  startNodeId,
  nodes,
  edges,
  nodeData,
  ollamaBaseUrl,
  sdforgeBaseUrl,
  dispatch,
  setLoading,
  setStreamingOutput,
  setDialogOpen,
  setFinalImage,
  setCurrentImage,
  setProgress,
  setCanceled,
  setIsGenerating,
  setProcessing,
}: {
  startNodeId: string;
  nodes: Node[];
  edges: Edge[];
  nodeData: Record<string, any>;
  ollamaBaseUrl: string;
  sdforgeBaseUrl: string;
  dispatch: AppDispatch;
  setLoading: (loading: boolean) => void;
  setStreamingOutput: React.Dispatch<React.SetStateAction<string>>;
  setDialogOpen: (open: boolean) => void;
  setFinalImage: (image: string | null) => void;
  setCurrentImage: (image: string | null) => void;
  setProgress: (progress: number) => void;
  setCanceled: (canceled: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setProcessing: (completed: boolean) => void;
}): Promise<void> => {
  setLoading(true);
  setStreamingOutput("");
  setDialogOpen(true);
  setFinalImage(null);
  setCurrentImage(null);

  const firstEdge = edges.find((edge) => edge.source === startNodeId);
  if (!firstEdge) {
    toast.warning("No nodes connected to Start Node!");
    setLoading(false);
    return;
  }

  try {
    // Using a helper function to create the correct updateStreamingOutput function
    setProcessing(true);
    const updateStreamingOutput =
      createStreamingOutputSetter(setStreamingOutput);

    await executeNode({
      nodeId: firstEdge.target,
      nodes,
      edges,
      nodeData,
      ollamaBaseUrl,
      sdforgeBaseUrl,
      dispatch,
      updateStreamingOutput,
      setProgress,
      setCurrentImage,
      setFinalImage,
      setCanceled,
      setIsGenerating,
      setProcessing,
    });
  } catch (error: any) {
    toast.error(`Workflow execution failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
