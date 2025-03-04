"use client";

import { type LucideIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addNode, setFlowData } from "@/lib/features/flowSlice";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { fetchProject, resetProjectStatus } from "@/lib/features/projectSlice";
import { useEffect } from "react";
import { toast } from "sonner";

export function NavMain({
  items,
  projects = [],
}: {
  items: {
    title: string;
    name: "startNode" | "ollamaNode" | "sdForgeNode";
    icon?: LucideIcon;
    disabled?: boolean;
  }[];
  projects: { _id: string; name: string }[];
}) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const nodes = useAppSelector((state) => state.flow.nodes);
  const project = useAppSelector((state) => state.project.project);
  const projectStatus = useAppSelector((state) => state.project.projectStatus);
  const base = useAppSelector((state) => state.base);

  useEffect(() => {
    if (projectStatus === "succeeded") {
      if (project.types.includes("ollamaNode") && !base.ollama.useOllama) {
        toast.error("Ollama is not enabled. Please enable it in the settings.");
      } else if (
        project.types.includes("sdForgeNode") &&
        !base.sdforge.useSdforge
      ) {
        toast.error(
          "Stable Diffusion is not enabled. Please enable it in the settings."
        );
      } else {
        dispatch(setFlowData(project.flow));
        dispatch(resetProjectStatus());
      }
    } else if (projectStatus === "failed") {
      dispatch(setFlowData({ edges: [], nodes: [], nodeData: {} }));
    }
  }, [projectStatus, dispatch]);

  const handleAddNode = (type: "startNode" | "ollamaNode" | "sdForgeNode") => {
    if (
      type === "startNode" &&
      nodes.some((node) => node.type === "startNode")
    ) {
      return; // Prevent adding another start node
    }
    dispatch(addNode({ type }));
  };

  const handleAddProject = (projectId: string) => {
    dispatch(fetchProject(projectId));
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Nodes</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.name === "startNode" ? (
                <SidebarMenuButton
                  onClick={() => handleAddNode(item.name)}
                  disabled={
                    nodes.some((node) => node.type === "startNode") ||
                    pathname !== "/"
                  }
                >
                  {item.icon && <item.icon size={16} />}
                  {item.title}
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  onClick={() => handleAddNode(item.name)}
                  disabled={item.disabled || pathname !== "/"}
                >
                  {item.icon && <item.icon size={16} />}
                  {item.title}
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <SidebarMenu>
          {projects.map((project) => (
            <SidebarMenuItem key={project._id}>
              <SidebarMenuButton onClick={() => handleAddProject(project._id)}>
                {project.name}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
