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

// This is sample data.
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
    },
    {
      title: "Stable Diffusion Nodes",
      name: "sdForgeNode" as const,
      icon: Image,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
