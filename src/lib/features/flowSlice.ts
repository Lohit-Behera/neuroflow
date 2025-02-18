import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Node, Edge } from "@xyflow/react";
import { NodeData, NodeDataMap } from "@/types/flowTypes";

// Define node types
export type NodeType = "startNode" | "ollamaNode" | "sdForgeNode";

interface AddNodePayload {
  type: NodeType;
}

// Define the state interface
interface FlowState {
  nodes: Node[];
  edges: Edge[];
  nodeData: NodeDataMap;
}

// Define the initial state
const initialState: FlowState = {
  nodes: [],
  edges: [],
  nodeData: {} as NodeDataMap,
};

// Create the slice
const flowSlice = createSlice({
  name: "flow",
  initialState,
  reducers: {
    addNode: (state, action: PayloadAction<AddNodePayload>) => {
      if (
        action.payload.type === "startNode" &&
        state.nodes.some((node) => node.type === "startNode")
      ) {
        return; // Prevent adding another start node
      }
      const id = `${state.nodes.length + 1}`;
      const newNode: Node = {
        id,
        type: action.payload.type,
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100,
        },
        data: {
          id,
          label: action.payload.type,
        },
      };

      // Store node data separately
      state.nodeData[id] = {
        id,
        label: action.payload.type,
      };

      state.nodes.push(newNode);
    },
    updateNodes: (state, action: PayloadAction<Node[]>) => {
      state.nodes = action.payload;
    },
    updateEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
    },
    addEdge: (state, action: PayloadAction<Edge>) => {
      state.edges.push(action.payload);
    },
    deleteNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      state.nodes = state.nodes.filter((node) => node.id !== nodeId);
      state.edges = state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      );
      delete state.nodeData[nodeId]; // Remove data when deleting a node
    },
    updateNodeData: (
      state,
      action: PayloadAction<{ id: string; data: NodeData }>
    ) => {
      const { id, data } = action.payload;
      if (state.nodeData[id]) {
        state.nodeData[id] = { ...state.nodeData[id], ...data };
      }
    },
  },
});

export const {
  addNode,
  updateNodes,
  updateEdges,
  addEdge,
  deleteNode,
  updateNodeData,
} = flowSlice.actions;
export default flowSlice.reducer;
