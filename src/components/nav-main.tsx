"use client";

import {
  Image,
  Play,
  Type,
  ChevronRight,
  ChartNetwork,
  Workflow,
  Network,
  FileStack,
  Settings2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addNode, setFlowData } from "@/lib/features/flowSlice";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import {
  fetchAllProjects,
  fetchProject,
  resetProjectStatus,
} from "@/lib/features/projectSlice";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export function NavMain() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const ollama = useAppSelector((state) => state.base.ollama);
  const sdforge = useAppSelector((state) => state.base.sdforge);
  const projects = useAppSelector((state) => state.project.allProjects);
  const allProjectStatus = useAppSelector(
    (state) => state.project.allProjectsStatus
  );
  const nodes = useAppSelector((state) => state.flow.nodes);
  const project = useAppSelector((state) => state.project.project);
  const projectStatus = useAppSelector((state) => state.project.projectStatus);
  const base = useAppSelector((state) => state.base);

  useEffect(() => {
    dispatch(fetchAllProjects());
  }, [dispatch]);

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
      return;
    }
    dispatch(addNode({ type }));
  };

  const handleAddProject = (projectId: string) => {
    dispatch(fetchProject(projectId));
  };

  return (
    <>
      <SidebarGroup>
        <Collapsible asChild defaultOpen className="group/collapsible">
          <div>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={"Nodes"}>
                <ChartNetwork />
                <span>Nodes</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {[
                  {
                    title: "Start Node",
                    name: "startNode",
                    icon: Play,
                    disabled: pathname !== "/",
                  },
                  {
                    title: "Ollama Nodes",
                    name: "ollamaNode",
                    icon: Type,
                    disabled: !ollama.useOllama && pathname !== "/",
                  },
                  {
                    title: "Stable Diffusion Nodes",
                    name: "sdForgeNode",
                    icon: Image,
                    disabled: !sdforge.useSdforge && pathname !== "/",
                  },
                ].map((item) => (
                  <SidebarMenuSubItem
                    key={item.title}
                    className="cursor-pointer"
                  >
                    <SidebarMenuSubButton asChild>
                      <Button
                        className="w-full justify-start"
                        variant="ghost"
                        disabled={item.disabled}
                        onClick={() =>
                          handleAddNode(
                            item.name as
                              | "startNode"
                              | "ollamaNode"
                              | "sdForgeNode"
                          )
                        }
                      >
                        {item.icon && <item.icon />}
                        {item.title}
                      </Button>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </SidebarGroup>
      <SidebarGroup>
        <Collapsible asChild>
          <div>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={"WorkFlow"}>
                <Network />
                <span>WorkFlow</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {allProjectStatus === "loading" ? (
                  <div className="grid gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-6 w-full" />
                    ))}
                  </div>
                ) : allProjectStatus === "succeeded" ? (
                  <>
                    {projects.map((project) => (
                      <SidebarMenuSubItem key={project._id}>
                        <SidebarMenuSubButton asChild>
                          <Button
                            className="w-full justify-start"
                            variant="ghost"
                            onClick={() => handleAddProject(project._id)}
                            disabled={pathname !== "/"}
                          >
                            <Workflow />
                            {project.name}
                          </Button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </>
                ) : null}
              </SidebarMenuSub>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </SidebarGroup>
    </>
  );
}
