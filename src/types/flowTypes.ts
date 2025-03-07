import { Node, Edge } from "@xyflow/react";
import { SerializableFileInfo } from "@/components/nodes/OllamaNode";

// Base node data that all nodes should have
export interface BaseNodeData {
  id: string;
  label?: string;
  description?: string;
  output?: string | null;
  image?: string | null;
  previousNodeOutputType?: "text" | "image";
  previousNodeLabel?: string;
}

// Ollama node specific data
export interface OllamaNodeData extends BaseNodeData {
  model: string;
  prompt: string;
  instructions: string;
  file?: SerializableFileInfo | null;
  temperature?: number;
  topK?: number;
  topP?: number;
  maxTokens?: number;
}

// SDForge node specific data
export interface SDForgeNodeData extends BaseNodeData {
  model: string;
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  samplingSteps: number;
  samplingMethod: string;
  guidanceScale: number;
  schedulerType: string;
}

// SD image to image node specific data
export interface SDImageToImageNodeData extends BaseNodeData {
  file?: SerializableFileInfo | null;
  model: string;
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  samplingSteps: number;
  samplingMethod: string;
  guidanceScale: number;
  schedulerType: string;
}

// Union type for all possible node data types
export type NodeData =
  | OllamaNodeData
  | SDForgeNodeData
  | SDImageToImageNodeData
  | BaseNodeData;

// Type for node data lookup by node ID
export interface NodeDataMap {
  [key: string]: NodeData;
}

// Type guards to determine node type
export function isOllamaNodeData(data: NodeData): data is OllamaNodeData {
  return (data as OllamaNodeData)
    ? (data as OllamaNodeData).prompt !== undefined &&
        (data as OllamaNodeData).instructions !== undefined
    : false;
}

export function isSDForgeNodeData(data: NodeData): data is SDForgeNodeData {
  return (data as SDForgeNodeData)
    ? (data as SDForgeNodeData).prompt !== undefined &&
        (data as SDForgeNodeData).samplingSteps !== undefined
    : false;
}

export function isSDImageToImageNodeData(
  data: NodeData
): data is SDImageToImageNodeData {
  return (data as SDImageToImageNodeData)
    ? (data as SDImageToImageNodeData).prompt !== undefined &&
        (data as SDImageToImageNodeData).samplingSteps !== undefined
    : false;
}

// Flow state in the Redux store
export interface FlowState {
  nodes: Node[];
  edges: Edge[];
  nodeData: NodeDataMap;
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
