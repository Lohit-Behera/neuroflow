import { AppDispatch } from "@/lib/store";
import { updateNodeData } from "@/lib/features/flowSlice";
import { toast } from "sonner";
import { isSDImageToImageNodeData, NodeDataMap } from "@/types/flowTypes";
import { SDImageToImageFileStorage } from "@/components/nodes/SDImageToImageNode";

interface ExecuteSDImageToImageNode {
  nodeId: string;
  input?: string;
  image?: string | null;
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

export const executeSDImageToImageNode = async ({
  nodeId,
  input = "",
  image,
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
}: ExecuteSDImageToImageNode): Promise<string> => {
  const targetNode = nodeData[nodeId];

  if (!targetNode) {
    toast.warning(`Node ${nodeId} not found!`);
    return "";
  }

  if (isSDImageToImageNodeData(targetNode)) {
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

    updateStreamingOutput(`\nExecuting SD Image to Image Node: ${nodeId}...\n`);

    try {
      const newPrompt = input || prompt;
      const file = SDImageToImageFileStorage.files[nodeId];
      console.log(file);

      let encodedImage = image; // Use existing image if no file is provided

      if (file) {
        const mimeType = file.type;

        if (!mimeType.startsWith("image/")) {
          toast.error(`Unsupported file type: ${mimeType}`);
          throw new Error(`Unsupported file type: ${mimeType}`);
        }

        const fileReader = new FileReader();

        // Convert file to Base64
        encodedImage = await new Promise<string>((resolve, reject) => {
          fileReader.onloadend = () => resolve(fileReader.result as string);
          fileReader.onerror = reject;
          fileReader.readAsDataURL(file);
        });
      }

      const requestBody = {
        init_images: [encodedImage],
        prompt: newPrompt,
        width: width || 512, // Default to 512 if not provided
        height: height || 512,
        steps: samplingSteps || 50,
        sampler_name: samplingMethod || "Euler a",
        cfg_scale: guidanceScale || 7.5,
        scheduler: schedulerType || "Karras",
        seed: Math.floor(Math.random() * 1e9),
        override_settings: {
          sd_model_checkpoint: model || "stable-diffusion-v1-5",
        },
      };

      const res = await fetch(`${sdforgeBaseUrl}/sdapi/v1/img2img`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
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
            image: imageData,
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
