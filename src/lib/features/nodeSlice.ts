import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Node } from "@xyflow/react";

interface CustomNodeData {
  label: string;
  [key: string]: unknown; // Allow additional properties
}

type CustomNode = Node<CustomNodeData, "ollamaNode" | "sdForgeNode">;

interface NodesState {
  nodes: CustomNode[];
}

const initialState: NodesState = {
  nodes: [],
};

const nodesSlice = createSlice({
  name: "nodes",
  initialState,
  reducers: {
    addNode: (
      state,
      action: PayloadAction<{ type: "ollamaNode" | "sdForgeNode" }>
    ) => {
      const id = `${state.nodes.length + 1}`;
      const newNode: CustomNode = {
        id,
        type: action.payload.type,
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100,
        },
        data: {
          label: action.payload.type === "ollamaNode" ? "Ollama" : "SD Forge",
        }, // Ensuring data conforms
      };
      state.nodes.push(newNode);
    },
  },
});

export const { addNode } = nodesSlice.actions;
export default nodesSlice.reducer;
