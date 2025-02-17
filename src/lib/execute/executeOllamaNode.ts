import { AppDispatch } from "@/lib/store";
import { updateNodeData } from "@/lib/features/flowSlice";
import { toast } from "sonner";
import { NodeData } from "@/types/flowTypes";

interface ExecuteOllamaNodeParams {
  nodeId: string;
  input?: string;
  nodeData: Record<string, any>;
  ollamaBaseUrl: string;
  dispatch: AppDispatch;
  updateStreamingOutput: (output: string) => void;
}

export const executeOllamaNode = async ({
  nodeId,
  input = "",
  nodeData,
  ollamaBaseUrl,
  dispatch,
  updateStreamingOutput,
}: ExecuteOllamaNodeParams): Promise<string> => {
  const targetNode = nodeData[nodeId];
  if (!targetNode) {
    toast.warning(`Node ${nodeId} not found!`);
    return "";
  }

  const { model, instructions, prompt } = targetNode;
  updateStreamingOutput(`\nExecuting Ollama Node: ${nodeId}...\n`);

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
      updateStreamingOutput(chunk);
    }

    dispatch(
      updateNodeData({ id: nodeId, data: { output: fullResponse } } as any)
    );

    return fullResponse;
  } catch (error: any) {
    const errorMessage = `Error in Ollama Node ${nodeId}: ${error.message}`;
    updateStreamingOutput("\n" + errorMessage);
    throw new Error(errorMessage);
  }
};
