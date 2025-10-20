import { Outlet, createFileRoute, useMatches } from "@tanstack/react-router";
import * as React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NavUser } from "@/components/nav-user";
import { Separator } from "@/components/ui/separator";
import { AiChatSession } from "@/components/ai-chat-session";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const matches = useMatches();

  // Build breadcrumbs from route matches
  const breadcrumbs = React.useMemo(() => {
    // Get all path segments from all matches
    const allSegments: Array<{ segment: string; fullPath: string }> = [];

    matches
      .filter((match) => match.routeId !== "__root__")
      .forEach((match) => {
        const segments = match.routeId
          .replace(/^\/dashboard\/?/, "") // Remove /dashboard prefix
          .split("/")
          .filter(Boolean); // Remove empty segments

        segments.forEach((segment, index) => {
          // Build full path up to this segment
          const pathUpToHere = segments.slice(0, index + 1);
          const fullPath =
            "/dashboard" +
            (pathUpToHere.length > 0 ? "/" + pathUpToHere.join("/") : "");

          // Only add if not already in the list (avoid duplicates)
          if (!allSegments.some((s) => s.fullPath === fullPath)) {
            allSegments.push({ segment, fullPath });
          }
        });
      });

    // Convert to breadcrumb objects
    return allSegments.map((item, index) => {
      const title = item.segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return {
        title,
        path: item.fullPath,
        isLast: index === allSegments.length - 1,
      };
    });
  }, [matches]);

  return (
    <SidebarProvider>
      <AppSidebar />
      {breadcrumbs.find((b) => b.path !== "/dashboard/ai-assistant") !==
      undefined ? (
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 w-full">
              <div className="flex items-center">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((breadcrumb, index) => (
                      <BreadcrumbItem
                        key={breadcrumb.title}
                        className={breadcrumb.isLast ? "font-medium" : ""}
                      >
                        {breadcrumb.isLast ? (
                          <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={breadcrumb.path}>
                            {breadcrumb.title}
                          </BreadcrumbLink>
                        )}
                        {index < breadcrumbs.length - 1 && (
                          <BreadcrumbSeparator className="hidden md:block" />
                        )}
                      </BreadcrumbItem>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div className="ml-auto">
                <NavUser
                  user={{
                    name: "shadcn",
                    email: "m@example.com",
                    avatar: "/avatars/shadcn.jpg",
                  }}
                />
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4">
            <Outlet />
          </div>
        </SidebarInset>
      ) : (
        <div className="flex h-screen w-full justify-center">
          <AiChatSession
            className="flex flex-col h-screen w-2xl"
            user={{
              name: "User",
              avatarUrl:
                "https://gravatar.com/avatar/4c8e7a1dbe3f19767ad1ddd0fdab02c223910fb442861249454bffd743e9272c?v=1758093380000&size=256&d=initials",
            }}
          />
        </div>
      )}
    </SidebarProvider>
  );
}
