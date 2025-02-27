import React from "react";
import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

export default function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: "#6d28d9",
          strokeWidth: 2,
          filter: "drop-shadow(0px 0px 6px #6d28d9)", // Glow effect
        }}
      />
      <circle r="8" fill="#6d28d9">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        <animate
          attributeType="XML"
          attributeName="r"
          values="8;12;8"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </>
  );
}
