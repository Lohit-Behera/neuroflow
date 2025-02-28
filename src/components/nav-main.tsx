"use client";

import { type LucideIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addNode } from "@/lib/features/flowSlice";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    name: "startNode" | "ollamaNode" | "sdForgeNode";
    icon?: LucideIcon;
    disabled?: boolean;
  }[];
}) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const nodes = useAppSelector((state) => state.flow.nodes);

  const handleAddNode = (type: "startNode" | "ollamaNode" | "sdForgeNode") => {
    if (
      type === "startNode" &&
      nodes.some((node) => node.type === "startNode")
    ) {
      return; // Prevent adding another start node
    }
    dispatch(addNode({ type }));
  };

  return (
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
  );
}
