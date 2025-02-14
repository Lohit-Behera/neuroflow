import React, { useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { Input } from "@/components/ui/input";

const OllamaNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const [prompt, setPrompt] = useState<string>(
    typeof data.prompt === "string" ? data.prompt : ""
  );

  return (
    <div className="p-4 bg-muted shadow-lg rounded-lg border">
      <div className="text-sm font-semibold mb-2">Ollama Node</div>
      <Input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="nodrag px-2 py-1 border rounded w-full"
        placeholder="Enter text prompt"
      />
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
