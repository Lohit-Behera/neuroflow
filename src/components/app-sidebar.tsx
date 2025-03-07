"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavLogo } from "@/components/nav-logo";
import { NavMain } from "./nav-main";
import NavSetting from "./nav-setting";

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavSetting />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
