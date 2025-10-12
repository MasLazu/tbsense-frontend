'use client';

import * as React from 'react';
import {
  Bot,
  ChartLine,
  ChartPie,
  Frame,
  Leaf,
  Map,
  MonitorCog,
  PieChart,
  Sprout,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
// import { NavProjects } from "@/components/nav-projects";
import { TeamSwitcher } from '@/components/team-switcher';
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'TB Sense',
      logo: Leaf,
      plan: 'Enterprise',
    },
  ],
  navMain: [
    {
      title: 'Overview',
      url: '/dashboard/overview',
      icon: ChartPie,
      isActive: true,
    },
    {
      title: 'Ai Assistant',
      url: '#',
      icon: Bot,
      isActive: true,
    },
    {
      title: 'Monitoring',
      url: '#',
      icon: ChartLine,
      isActive: true,
      items: [
        {
          title: 'Environment',
          url: '/dashboard/monitoring/environment',
        },
        {
          title: 'Distribution',
          url: '/dashboard/monitoring/distribution',
        },
        {
          title: 'Harvest',
          url: '/dashboard/monitoring/harvest',
        },
        {
          title: 'Statistics',
          url: '/dashboard/monitoring/statistics',
        },
      ],
    },
    {
      title: 'Plantations',
      url: '/dashboard/plantations',
      icon: Sprout,
    },
    {
      title: 'Ai Management',
      url: '#',
      icon: MonitorCog,
      isActive: true,
      items: [
        {
          title: 'Knowledge Base',
          url: '/dashboard/ai-management/knowledge-base',
        },
        {
          title: 'System Prompt',
          url: '/dashboard/ai-management/system-prompt',
        },
        {
          title: 'Prediction',
          url: '/dashboard/ai-management/prediction',
        },
      ],
    },
    {
      title: 'Map',
      url: '#',
      icon: Map,
      isActive: true,
      items: [
        {
          title: 'Area',
          url: '/dashboard/map/area',
        },
        {
          title: 'Tree',
          url: '/dashboard/map/tree',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
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
        {/* <NavMain items={data.navMain} groupLabel="Management" />
        <NavMain items={data.navMain} groupLabel="Settings" /> */}
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      {/* <SidebarFooter>NavUser moved to dashboard header</SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
