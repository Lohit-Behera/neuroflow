"use client";

import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
} from "@xyflow/react";
import CustomNode from "@/components/nodes/CustomNode";
import "@xyflow/react/dist/style.css";

const nodeTypes = { customNode: CustomNode };

const initialNodes = [
  {
    id: "1",
    type: "customNode",
    position: { x: 200, y: 100 },
    data: { label: "Node 1" },
  },
  {
    id: "2",
    type: "customNode",
    position: { x: 500, y: 100 },
    data: { label: "Node 2" },
  },
];

const initialEdges: Edge[] = [];

const Flow: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#f0f0f0" />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default Flow;
