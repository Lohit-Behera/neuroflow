import React, { useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";

const SDForgeNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const [imagePrompt, setImagePrompt] = useState<string>(
    typeof data.prompt === "string" ? data.prompt : ""
  );

  return (
    <div className="p-4 bg-muted shadow-lg rounded-lg border">
      <div className="text-sm font-semibold mb-2">SD Forge Node</div>
      <input
        type="text"
        value={imagePrompt}
        onChange={(e) => setImagePrompt(e.target.value)}
        className="nodrag px-2 py-1 border rounded w-full"
        placeholder="Enter image prompt"
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

export default SDForgeNode;
