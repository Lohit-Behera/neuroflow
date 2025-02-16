import React, { useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { deleteNode, updateNodeData } from "@/lib/features/flowSlice";
import { toast } from "sonner";

const OllamaNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const dispatch = useAppDispatch();
  const id = data["id"] as string;

  const ollamaModels = useAppSelector((state) => state.ollama.models);
  const nodeData = useAppSelector((state) => state.flow.nodeData[id]) || {};

  const [model, setModel] = useState(nodeData.model || "");
  const [instructions, setInstructions] = useState(nodeData.instructions || "");
  const [prompt, setPrompt] = useState(nodeData.prompt || "");
  const handleSetData = () => {
    dispatch(updateNodeData({ id, data: { model, instructions, prompt } }));
    toast.info(
      `Data Set!\nModel: ${model}\nInstructions: ${instructions}\nPrompt: ${prompt}`
    );
  };
  return (
    <div className="grid gap-4 p-4 bg-muted shadow-lg rounded-lg border w-[350px]">
      <div className="flex justify-between">
        <h4 className="text-sm md:text-lg text-center font-semibold mb-2">
          Ollama Node
        </h4>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => dispatch(deleteNode(id))}
        >
          <Trash2 />
        </Button>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="model">Model</Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="nodrag">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent className="nodrag">
            {ollamaModels.map((m) => (
              <SelectItem key={m.name} value={m.name}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="nodrag px-2 py-1 border rounded w-full"
          placeholder="Enter prompt"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="nodrag px-2 py-1 border rounded w-full"
          placeholder="Enter instructions"
        />
      </div>
      <Button onClick={handleSetData} className="nodrag w-full">
        Set Data
      </Button>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-700 rounded-full"
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-700 rounded-full"
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default OllamaNode;
