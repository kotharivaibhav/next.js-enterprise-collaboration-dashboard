"use client";

import {
  Building2,
  FileText,
  Kanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPaletteTrigger } from "@/features/command-palette/components/command-palette-trigger";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { WorkspaceSwitcher } from "@/features/workspaces/components/workspace-switcher";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser, useLogout } from "@/features/auth/hooks/use-auth";
import { useUiStore } from "@/store/ui-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.workspaces, label: "Workspaces", icon: Building2 },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  const channelNavItem = activeWorkspaceId
    ? {
        href: ROUTES.workspaceChannels(activeWorkspaceId),
        label: "Channels",
        icon: MessageSquare,
      }
    : null;

  const boardsNavItem = activeWorkspaceId
    ? {
        href: ROUTES.workspaceBoards(activeWorkspaceId),
        label: "Boards",
        icon: Kanban,
      }
    : null;

  const documentsNavItem = activeWorkspaceId
    ? {
        href: ROUTES.workspaceDocuments(activeWorkspaceId),
        label: "Documents",
        icon: FileText,
      }
    : null;

  const allNavItems = [
    ...navItems,
    ...(channelNavItem ? [channelNavItem] : []),
    ...(boardsNavItem ? [boardsNavItem] : []),
    ...(documentsNavItem ? [documentsNavItem] : []),
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "hidden border-r bg-sidebar text-sidebar-foreground transition-all md:flex md:flex-col",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          {!sidebarCollapsed && <Logo />}
        </div>
        <div className="border-b p-2">
          <WorkspaceSwitcher collapsed={sidebarCollapsed} />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {allNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive &&
                    "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? "→" : "← Collapse"}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Logo />
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">
            Enterprise collaboration platform
          </p>
          <div className="flex items-center gap-2">
            <CommandPaletteTrigger />
            <NotificationBell />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  className="relative size-9 rounded-full p-0"
                >
                  <Avatar>
                    <AvatarFallback>
                      {user ? getInitials(user.full_name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.full_name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                >
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
