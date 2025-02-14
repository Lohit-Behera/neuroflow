import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Node, Edge } from "@xyflow/react";

// Define node types
export type NodeType = "ollamaNode" | "sdForgeNode";

interface AddNodePayload {
  type: NodeType;
}

// Define the state interface
interface FlowState {
  nodes: Node[];
  edges: Edge[];
}

// Define the initial state
const initialState: FlowState = {
  nodes: [],
  edges: [],
};

// Create the slice
const flowSlice = createSlice({
  name: "flow",
  initialState,
  reducers: {
    addNode: (state, action: PayloadAction<AddNodePayload>) => {
      const id = `${state.nodes.length + 1}`;
      const newNode: Node = {
        id,
        type: action.payload.type,
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100,
        },
        data: {
          label: action.payload.type === "ollamaNode" ? "Ollama" : "SD Forge",
        },
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
  },
});

export const { addNode, updateNodes, updateEdges, addEdge } = flowSlice.actions;
export default flowSlice.reducer;
