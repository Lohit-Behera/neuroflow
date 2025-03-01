// components/Flow.tsx
"use client";

import React, { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Connection,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  EdgeChange,
  NodeChange,
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
import { ZoomSlider } from "@/components/zoom-slider";
import ConnectionLine from "@/components/ConnectionLine";
import AnimatedEdge from "./AnimatedEdge";

const nodeTypes = {
  startNode: StartNode,
  ollamaNode: OllamaNode,
  sdForgeNode: SDForgeNode,
};

const edgeTypes = {
  animatedSvg: AnimatedEdge,
};

const Flow: React.FC = () => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector((state) => state.flow.nodes);
  const edges = useAppSelector((state) => state.flow.edges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      dispatch(updateNodes(updatedNodes));
    },
    [nodes, dispatch]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      dispatch(updateEdges(updatedEdges));
    },
    [edges, dispatch]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const isSourceConnected = edges.some(
        (edge) => edge.source === params.source
      );

      if (!isSourceConnected) {
        dispatch(addFlowEdge(params as Edge));
      }
    },
    [edges, dispatch]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges.map((edge) => ({
          ...edge,
          id: edge.id || `${edge.source}-${edge.target}`,
          animated: true,
          style: { stroke: "#6d28d9", strokeWidth: 2 },
        }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineComponent={ConnectionLine} // Use the custom connection line
        fitView
      >
        <Background size={2} gap={22} />
        <ZoomSlider />
      </ReactFlow>
    </div>
  );
};

export default Flow;
