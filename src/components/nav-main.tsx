"use client";

import { ChevronRight, Plus, type LucideIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addNode } from "@/lib/features/flowSlice";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    name: "ollamaNode" | "sdForgeNode";
    icon?: LucideIcon;
  }[];
}) {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector((state) => state.flow.nodes);

  const handleAddNode = (type: "ollamaNode" | "sdForgeNode") => {
    dispatch(addNode({ type }));
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Nodes</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton onClick={() => handleAddNode(item.name)}>
              {item.icon && <item.icon size={16} />}
              {item.title}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
