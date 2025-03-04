"use client";

import * as React from "react";
import { Image, Play, Type } from "lucide-react";
import { useRouter } from "next/navigation";
import { NavMain } from "@/components/nav-main";
import { NavLogo } from "@/components/nav-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchAllProjects } from "@/lib/features/projectSlice";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const ollama = useAppSelector((state) => state.base.ollama);
  const sdorge = useAppSelector((state) => state.base.sdforge);
  const projects = useAppSelector((state) => state.project.allProjects);
  const data = {
    navMain: [
      {
        title: "Start Node",
        name: "startNode" as const,
        icon: Play,
      },
      {
        title: "Ollama Nodes",
        name: "ollamaNode" as const,
        icon: Type,
        disabled: !ollama.useOllama,
      },
      {
        title: "Stable Diffusion Nodes",
        name: "sdForgeNode" as const,
        icon: Image,
        disabled: !sdorge.useSdforge,
      },
    ],
  };

  React.useEffect(() => {
    dispatch(fetchAllProjects());
  }, [dispatch]);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} projects={projects} />
        <Button
          variant={"secondary"}
          size="sm"
          onClick={() => {
            router.push("/output");
          }}
        >
          Out Put
        </Button>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
