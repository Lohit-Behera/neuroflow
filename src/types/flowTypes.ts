import { Node, Edge } from "@xyflow/react";

// Base node data that all nodes should have
export interface BaseNodeData {
  label?: string;
  description?: string;
  output?: string | null;
  outputType?: "text" | "image";
}

// Ollama node specific data
export interface OllamaNodeData extends BaseNodeData {
  model: string;
  prompt: string;
  instructions: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  maxTokens?: number;
}

// SDForge node specific data
export interface SDForgeNodeData extends BaseNodeData {
  model: string;
  imagePrompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  samplingSteps: number;
  samplingMethod: string;
  guidanceScale: number;
  schedulerType: string;
}

// Union type for all possible node data types
export type NodeData = OllamaNodeData | SDForgeNodeData;

// Type for node data lookup by node ID
export interface NodeDataMap {
  [key: string]: NodeData;
}

// Flow state in the Redux store
export interface FlowState {
  nodes: Node[];
  edges: Edge[];
  nodeData: NodeDataMap;
  selectedNodeId: string | null;
}

// Actions for updating flow state
export interface UpdateNodeDataAction {
  id: string;
  data: Partial<NodeData>;
}

export interface UpdateNodesAction {
  nodes: Node[];
}

export interface UpdateEdgesAction {
  edges: Edge[];
}

export interface SelectNodeAction {
  id: string | null;
}

// Input/output for workflow execution
export interface ExecutionInput {
  nodeId: string;
  input?: string;
}

export interface ExecutionResult {
  output: string;
  outputType: "text" | "image";
  error?: string;
}

// Configuration types for services
export interface OllamaConfig {
  baseUrl: string;
  models: string[];
}

export interface SDForgeConfig {
  baseUrl: string;
  models: string[];
  samplingMethods: string[];
  schedulerTypes: string[];
}

export interface BaseConfig {
  ollama: OllamaConfig;
  sdforge: SDForgeConfig;
}
