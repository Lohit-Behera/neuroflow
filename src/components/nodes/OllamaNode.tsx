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
import Image from "next/image";
import { useTheme } from "next-themes";

export const OllamaFileStorage = {
  files: {} as Record<string, File>,

  storeFile: (file: File, id: string): void => {
    OllamaFileStorage.files[id] = file;
  },

  getFile: (id: string): File | null => {
    return OllamaFileStorage.files[id] || null;
  },

  removeFile: (id: string): void => {
    if (OllamaFileStorage.files[id]) {
      delete OllamaFileStorage.files[id];
    }
  },
};

export interface SerializableFileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

const OllamaNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const dispatch = useAppDispatch();
  const id = data["id"] as string;
  const { theme } = useTheme();

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
    // When file changes, store it in the global storage
    if (file) {
      // Use node ID as file ID for simplicity
      OllamaFileStorage.storeFile(file, id);
    } else {
      // Remove file if no longer needed
      OllamaFileStorage.removeFile(id);
    }

    // Create serializable file info
    let fileInfo: SerializableFileInfo | null = null;
    if (file) {
      fileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      };
    }

    // Update Redux with serializable info only
    dispatch(
      updateNodeData({
        id,
        data: {
          id,
          model,
          instructions,
          prompt,
          file: fileInfo,
        },
      })
    );
  }, [model, instructions, prompt, dispatch, id, file]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      OllamaFileStorage.removeFile(id);
    };
  }, [id]);

  return (
    <div className="grid gap-4 p-4 bg-muted shadow-lg rounded-lg border w-[350px]">
      <div className="flex justify-between">
        <div className="flex space-x-2 items-center">
          <Image
            src="/ollama.svg"
            width={30}
            height={30}
            alt="ollama"
            className={`w-10 h-10 nodrag ${theme === "dark" ? "invert" : ""}`}
          />
          <h4 className="text-sm md:text-lg text-center font-semibold ">
            Ollama Node
          </h4>
        </div>
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
        style={{
          width: "16px",
          height: "16px",
          background: "#6d28d9",
        }}
        isConnectable={isConnectable}
      />
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
    </div>
  );
};

export default OllamaNode;
