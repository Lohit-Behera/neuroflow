import React, { useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";

const CustomNode: React.FC<NodeProps> = ({ id, data, isConnectable }) => {
  const [label, setLabel] = useState(data.label || "");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg border">
      <div className="text-sm font-semibold mb-2">Custom Node</div>
      <input
        type="text"
        onChange={handleChange}
        className="nodrag px-2 py-1 border rounded w-full"
        placeholder="Enter label"
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

export default CustomNode;
