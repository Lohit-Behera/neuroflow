import React, { useState, useEffect } from "react";
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
import { Input } from "../ui/input";

const OllamaNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const dispatch = useAppDispatch();
  const id = data["id"] as string;

  const ollamaModels = useAppSelector((state) => state.ollama.models);
  const edges = useAppSelector((state) => state.flow.edges);
  const nodeData = useAppSelector((state) => state.flow.nodeData);

  const [model, setModel] = useState("");
  const [instructions, setInstructions] = useState("");
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [disabled, setDisabled] = useState({
    prompt: false,
    file: false,
  });

  useEffect(() => {
    const edge = edges.find((e) => e.target === id);
    const previousNode = nodeData[edge?.source as string];
    if (previousNode) {
      if (previousNode.label === "ollamaNode") {
        setDisabled({ ...disabled, prompt: true });
        setPrompt("");
      } else if (previousNode.label === "sdForgeNode") {
        setDisabled({ prompt: true, file: true });
        setPrompt("");
        setFile(null);
      } else {
        setDisabled({ prompt: false, file: false });
      }
    }
  }, [edges, id]);

  useEffect(() => {
    dispatch(
      updateNodeData({ id, data: { id, model, instructions, prompt, file } })
    );
  }, [model, instructions, prompt, dispatch, id, file]);

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
          disabled={disabled.prompt}
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
      <div className="grid gap-2">
        <Label htmlFor="filedata">File</Label>
        <Input
          id="filedata"
          type="file"
          disabled={disabled.file}
          onChange={(e) => {
            setFile(e.target.files ? e.target.files[0] : null);
            setPrompt("");
            setDisabled({ ...disabled, prompt: true });
          }}
          className="nodrag "
          placeholder="Add file"
        />
      </div>

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
