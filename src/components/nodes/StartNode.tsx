import React, { useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateNodeData } from "@/lib/features/flowSlice";
import { toast } from "sonner";

const StartNode: React.FC<NodeProps> = ({ id, isConnectable }) => {
  const dispatch = useAppDispatch();
  const edges = useAppSelector((state) => state.flow.edges);
  const nodeData = useAppSelector((state) => state.flow.nodeData);
  const baseUrl = useAppSelector((state) => state.base.ollama.baseUrl);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [streamingOutput, setStreamingOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const executeNode = async (nodeId: string, input: string = "") => {
    const targetNode = nodeData[nodeId];
    if (!targetNode) {
      toast.warning(`Node ${nodeId} not found!`);
      return;
    }

    const { model, instructions, prompt } = targetNode;
    setStreamingOutput(`Executing Node: ${targetNode.label}...\n`);
    setDialogOpen(true);

    try {
      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input || prompt, // Use the passed input or the node's prompt
          instructions,
          model,
          baseUrl,
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

      // Update the node's output in the Redux store
      dispatch(
        updateNodeData({ id: nodeId, data: { output: fullResponse } } as any)
      );

      // Find the next node and execute it with the current output as input
      const nextEdge = edges.find((edge) => edge.source === nodeId);
      if (nextEdge) {
        await executeNode(nextEdge.target, fullResponse); // Pass output to the next node
      } else {
        setStreamingOutput((prev) => prev + "\n\n🚀 Execution Complete!");
      }
    } catch (error: any) {
      setStreamingOutput(`Error in ${targetNode.label}: ${error.message}`);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setStreamingOutput("");
    setDialogOpen(true);

    const firstEdge = edges.find((edge) => edge.source === id);
    if (!firstEdge) {
      alert("No nodes connected to Start Node!");
      setLoading(false);
      return;
    }

    await executeNode(firstEdge.target);
    setLoading(false);
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processing Workflow</DialogTitle>
          </DialogHeader>
          <pre className="text-sm whitespace-pre-wrap">{streamingOutput}</pre>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartNode;
