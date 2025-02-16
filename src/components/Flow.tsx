"use client";
import React, { useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  updateNodes,
  updateEdges,
  addEdge as addFlowEdge,
} from "@/lib/features/flowSlice";
import OllamaNode from "@/components/nodes/OllamaNode";
import SDForgeNode from "@/components/nodes/SDForgeNode";
import StartNode from "@/components/nodes/StartNode";
import "@xyflow/react/dist/style.css";

const nodeTypes = {
  startNode: StartNode,
  ollamaNode: OllamaNode,
  sdForgeNode: SDForgeNode,
};

const Flow: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const nodes = useAppSelector((state) => state.flow.nodes);
  const edges = useAppSelector((state) => state.flow.edges);

  const onNodesChange = useCallback(
    (changes: any) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      dispatch(updateNodes(updatedNodes));
    },
    [nodes, dispatch]
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      dispatch(updateEdges(updatedEdges));
    },
    [edges, dispatch]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      dispatch(addFlowEdge(params as Edge));
    },
    [dispatch]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges.map((edge) => ({
          ...edge,
          id: edge.id || `${edge.source}-${edge.target}`,
        }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background
          size={2}
          gap={22}
          color={theme === "dark" ? "#fff" : "#000"}
        />
      </ReactFlow>
    </div>
  );
};

export default Flow;
