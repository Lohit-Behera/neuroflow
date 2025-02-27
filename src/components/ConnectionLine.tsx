// components/CustomConnectionLine.tsx
import React from "react";
import { ConnectionLineComponentProps } from "@xyflow/react";

const ConnectionLine: React.FC<ConnectionLineComponentProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  connectionLineStyle,
}) => {
  return (
    <g>
      <path
        fill="none"
        stroke="#6d28d9"
        strokeWidth={1.5}
        className="animated"
        d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
        style={{ ...connectionLineStyle }}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={3}
        stroke="#222"
        strokeWidth={1.5}
      />
    </g>
  );
};

export default ConnectionLine;
