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
  MoreVertical,
  Pencil,
  Trash2,
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
  fetchDeleteProject,
  fetchProject,
  fetchRenameProject,
  resetProjectStatus,
} from "@/lib/features/projectSlice";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

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

  const [openRename, setOpenRename] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
  const [newWorkflowName, setNewWorkflowName] = useState<string>("");

  useEffect(() => {
    if (projects.length === 0 && allProjectStatus === "idle") {
      dispatch(fetchAllProjects());
    }
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

  const handleRenameWorkflow = () => {
    const renamePromise = dispatch(
      fetchRenameProject({ projectId: selectedWorkflow, name: newWorkflowName })
    ).unwrap();
    toast.promise(renamePromise, {
      loading: "Renaming workflow...",
      success: (data) => {
        setOpenRename(false);
        setNewWorkflowName("");
        setSelectedWorkflow("");
        dispatch(fetchAllProjects());
        return data.message || "Workflow renamed successfully";
      },
      error: (error) => {
        return (
          error ||
          error.message ||
          "Something went wrong while renaming workflow"
        );
      },
    });
  };

  const handleDeleteWorkflow = (id: string) => {
    const deletePromise = dispatch(fetchDeleteProject(id)).unwrap();
    toast.promise(deletePromise, {
      loading: "Deleting workflow...",
      success: (data) => {
        dispatch(fetchAllProjects());
        return data.message || "Workflow deleted successfully";
      },
      error: (error) => {
        return (
          error ||
          error.message ||
          "Something went wrong while deleting workflow"
        );
      },
    });
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
                    disabled: !ollama.useOllama || pathname !== "/",
                  },
                  {
                    title: "Stable Diffusion Nodes",
                    name: "sdForgeNode",
                    icon: Image,
                    disabled: !sdforge.useSdforge || pathname !== "/",
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
                          <div className="flex group/item">
                            <Button
                              className="flex-1 w-full justify-start px-0 py-0 hover:bg-transparent"
                              variant="ghost"
                              onClick={() => handleAddProject(project._id)}
                              disabled={pathname !== "/"}
                            >
                              <Workflow />
                              <span className="truncate">{project.name}</span>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 p-0 opacity-0 group-hover/item:opacity-100 data-[state=open]:opacity-100 transition-opacity ${
                                    pathname !== "/"
                                      ? "pointer-events-none"
                                      : ""
                                  }`}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setOpenRename(true);
                                    setSelectedWorkflow(project._id);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteWorkflow(project._id)
                                  }
                                  className="text-destructive focus:text-destructive cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </>
                ) : null}
              </SidebarMenuSub>
            </CollapsibleContent>
          </div>
        </Collapsible>
        <AlertDialog open={openRename}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rename Workflow</AlertDialogTitle>
              <AlertDialogDescription className="grid gap-4">
                <Input
                  id="name"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder="Workflow Name"
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setOpenRename(false);
                  setSelectedWorkflow("");
                  setNewWorkflowName("");
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleRenameWorkflow}>
                Rename
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarGroup>
    </>
  );
}
