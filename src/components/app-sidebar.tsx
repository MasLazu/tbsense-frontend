"use client";

import * as React from "react";
import {
  AudioWaveform,
  Bot,
  ChartPie,
  Command,
  Frame,
  GalleryVerticalEnd,
  Globe,
  Map,
  PieChart,
  Sprout,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
// import { NavProjects } from "@/components/nav-projects";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "/dashboard/overview",
      icon: ChartPie,
      isActive: true,
    },
    {
      title: "Ai Assistant",
      url: "#",
      icon: Bot,
      isActive: true,
    },
    {
      title: "Globals",
      url: "#",
      icon: Globe,
      isActive: true,
      items: [
        {
          title: "Environment",
          url: "/dashboard/global/environment",
        },
        {
          title: "Distribution",
          url: "/dashboard/global/distribution",
        },
        {
          title: "Harvest",
          url: "/dashboard/global/harvest",
        },
        {
          title: "Statistics",
          url: "/dashboard/global/statistics",
        },
      ],
    },
    {
      title: "Plantations",
      url: "#",
      icon: Sprout,
      items: [
        {
          title: "Environment",
          url: "/dashboard/plantations/environment",
        },
        {
          title: "Distribution",
          url: "/dashboard/plantations/distribution",
        },
        {
          title: "Harvest",
          url: "/dashboard/plantations/harvest",
        },
        {
          title: "Statistics",
          url: "/dashboard/plantations/statistics",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} groupLabel="Dashboard" />
        <NavMain items={data.navMain} groupLabel="Management" />
        <NavMain items={data.navMain} groupLabel="Settings" />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>{/* NavUser moved to dashboard header */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
