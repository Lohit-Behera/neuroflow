import React, { useState, useEffect } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { deleteNode, updateNodeData } from "@/lib/features/flowSlice";
import { isSDForgeNodeData } from "@/types/flowTypes";

const SDForgeNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const dispatch = useAppDispatch();
  const id = data["id"] as string;

  const samplers = useAppSelector((state) => state.sd.samplers);
  const schedulers = useAppSelector((state) => state.sd.schedulers);
  const allModels = useAppSelector((state) => state.sd.models);

  const edges = useAppSelector((state) => state.flow.edges);
  const nodeData = useAppSelector((state) => state.flow.nodeData);

  const [prompt, setPrompt] = useState<string>(
    isSDForgeNodeData(nodeData[id]) ? nodeData[id].prompt : ""
  );
  const [model, setModel] = useState<string>(
    isSDForgeNodeData(nodeData[id]) ? nodeData[id]?.model : ""
  );
  const [width, setWidth] = useState<number>(
    isSDForgeNodeData(nodeData[id]) ? nodeData[id].width : 512
  );
  const [height, setHeight] = useState<number>(
    isSDForgeNodeData(nodeData[id]) ? nodeData[id].height : 521
  );
  const [samplingSteps, setSamplingSteps] = useState<number>(
    isSDForgeNodeData(nodeData[id]) ? nodeData[id].samplingSteps : 20
  );
  const [samplingMethod, setSamplingMethod] = useState<string>(
    isSDForgeNodeData(nodeData[id]) ? nodeData[id].samplingMethod : "Euler a"
  );
  const [guidanceScale, setGuidanceScale] = useState<number>(
    isSDForgeNodeData(nodeData[id]) ? nodeData[id].guidanceScale : 7
  );
  const [schedulerType, setSchedulerType] = useState<string>(
    isSDForgeNodeData(nodeData[id]) ? nodeData[id].schedulerType : "automatic"
  );
  const [disabledPrompt, setDisabledPrompt] = useState(false);

  useEffect(() => {
    const edge = edges.find((e) => e.target === id);
    const previousNode = nodeData[edge?.source as string];
    if (previousNode) {
      if (previousNode.label === "ollamaNode") {
        setDisabledPrompt(true);
        setPrompt("");
      } else {
        setDisabledPrompt(false);
      }
    }
  }, [edges, id]);

  useEffect(() => {
    dispatch(
      updateNodeData({
        id,
        data: {
          id,
          model,
          prompt,
          width,
          height,
          samplingSteps,
          samplingMethod,
          guidanceScale,
          schedulerType,
        },
      })
    );
  }, [
    id,
    model,
    prompt,
    width,
    height,
    samplingSteps,
    samplingMethod,
    guidanceScale,
    schedulerType,
    dispatch,
  ]);

  return (
    <div className="grid gap-4 p-4 bg-muted shadow-lg rounded-lg border">
      <div className="flex justify-between">
        <h4 className="text-sm md:text-lg text-center font-semibold mb-2">
          SD Forge Node
        </h4>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => dispatch(deleteNode(id))}
        >
          <Trash2 />
        </Button>
      </div>
      <div className="grid gap-2">
        <Label className="text-xs font-semibold">Image Prompt</Label>
        <Textarea
          disabled={disabledPrompt}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="nodrag px-2 py-1 border rounded w-full"
          placeholder="Enter image prompt"
        />
      </div>
      <div className="grid gap-2">
        <Label className="text-xs font-semibold">Model</Label>
        <Select
          value={model}
          onValueChange={(value) => setModel(value)}
          defaultValue={model}
        >
          <SelectTrigger className="nodrag px-2 py-1 border rounded w-full">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {allModels.map((model) => (
              <SelectItem key={model.model_name} value={model.model_name}>
                {model.model_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="grid gap-2">
          <Label className="text-xs font-semibold">Width</Label>
          <Input
            type="number"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="nodrag px-2 py-1 border rounded w-full"
            placeholder="Enter width"
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-xs font-semibold">Height</Label>
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="nodrag px-2 py-1 border rounded w-full"
            placeholder="Enter height"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label className="text-xs font-semibold">Sampling Steps</Label>
        <Input
          type="number"
          value={samplingSteps}
          onChange={(e) => setSamplingSteps(parseInt(e.target.value))}
          className="nodrag px-2 py-1 border rounded w-full"
          placeholder="Enter sampling steps"
        />
      </div>
      <div className="grid gap-2">
        <Label className="text-xs font-semibold">Guidance Scale</Label>
        <Input
          type="number"
          value={guidanceScale}
          onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
          className="nodrag px-2 py-1 border rounded w-full"
          placeholder="Enter guidance scale"
        />
      </div>
      <div className="grid gap-2">
        <Label className="text-xs font-semibold">Sampling Method</Label>
        <Select
          value={samplingMethod}
          onValueChange={(e) => setSamplingMethod(e)}
        >
          <SelectTrigger className="nodrag px-2 py-1 border rounded w-full">
            <SelectValue placeholder="Select sampling method" />
          </SelectTrigger>
          <SelectContent>
            {samplers.map((sampler) => (
              <SelectItem key={sampler.name} value={sampler.name}>
                {sampler.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label className="text-xs font-semibold">Scheduler</Label>
        <Select
          value={schedulerType}
          onValueChange={(e) => setSchedulerType(e)}
        >
          <SelectTrigger className="nodrag px-2 py-1 border rounded w-full">
            <SelectValue placeholder="Select scheduler" />
          </SelectTrigger>
          <SelectContent>
            {schedulers.map((scheduler) => (
              <SelectItem key={scheduler.name} value={scheduler.name}>
                {scheduler.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: "16px",
          height: "16px",
          background: "#6d28d9",
        }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: "16px",
          height: "16px",
          background: "#6d28d9",
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default SDForgeNode;
