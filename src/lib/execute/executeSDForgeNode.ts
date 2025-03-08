import { AppDispatch } from "@/lib/store";
import { updateNodeData } from "@/lib/features/flowSlice";
import { toast } from "sonner";
import { isSDForgeNodeData, NodeDataMap } from "@/types/flowTypes";

interface ExecuteSDForgeNodeParams {
  nodeId: string;
  input?: string;
  nodeData: NodeDataMap;
  sdforgeBaseUrl: string;
  dispatch: AppDispatch;
  updateStreamingOutput: (output: string) => void;
  setProgress: (progress: number) => void;
  setCurrentImage: (image: string | null) => void;
  setFinalImage: (image: string | null) => void;
  setCanceled: (canceled: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setImageNode: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const executeSDForgeNode = async ({
  nodeId,
  input = "",
  nodeData,
  sdforgeBaseUrl,
  dispatch,
  updateStreamingOutput,
  setProgress,
  setCurrentImage,
  setFinalImage,
  setCanceled,
  setIsGenerating,
  setImageNode,
}: ExecuteSDForgeNodeParams): Promise<string> => {
  const targetNode = nodeData[nodeId];

  if (!targetNode) {
    toast.warning(`Node ${nodeId} not found!`);
    return "";
  }

  if (isSDForgeNodeData(targetNode)) {
    setProgress(0);
    setCurrentImage(null);
    setFinalImage(null);
    setCanceled(false);
    setIsGenerating(true);

    const {
      prompt,
      model,
      width,
      height,
      samplingSteps,
      samplingMethod,
      guidanceScale,
      schedulerType,
    } = targetNode;

    updateStreamingOutput(`\nExecuting SDForge Node: ${nodeId}...\n`);

    try {
      const newPrompt = input || prompt;
      const res = await fetch(`${sdforgeBaseUrl}/sdapi/v1/txt2img`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: newPrompt,
          width,
          height,
          steps: samplingSteps,
          sampler_name: samplingMethod,
          cfg_scale: guidanceScale,
          scheduler: schedulerType,
          seed: Math.floor(Math.random() * 1000000000),
          override_settings: {
            sd_model_checkpoint: model,
          },
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const imageData = data.images[0];
      const finalImageUrl = `data:image/png;base64,${imageData}`;
      setImageNode((prevImageNode) => ({
        ...prevImageNode,
        [nodeId]: finalImageUrl,
      }));
      setFinalImage(finalImageUrl);
      setProgress(100);
      setIsGenerating(false);

      dispatch(
        updateNodeData({
          id: nodeId,
          data: {
            id: nodeId,
            output: imageData,
          },
        })
      );

      updateStreamingOutput(`\nImage generated successfully!\n`);
      return imageData;
    } catch (error) {
      setIsGenerating(false);
      if (error instanceof Error) {
        const errorMessage = `Error in SDForge Node ${nodeId}: ${error.message}`;
        updateStreamingOutput("\n" + errorMessage);
        throw new Error(errorMessage);
      } else {
        const errorMessage = `Error in SDForge Node ${nodeId}: ${error}`;
        updateStreamingOutput("\n" + errorMessage);
        throw new Error(errorMessage);
      }
    }
  } else {
    toast.warning(`Node ${nodeId} is not an SDForge node!`);
    throw new Error(`Node ${nodeId} is not an SDForge node!`);
  }
};
