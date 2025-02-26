"use client";

import * as React from "react";
import { Image, Play, Type } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavLogo } from "@/components/nav-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAppSelector } from "@/lib/hooks";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const ollama = useAppSelector((state) => state.base.ollama);
  const sdorge = useAppSelector((state) => state.base.sdforge);
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
