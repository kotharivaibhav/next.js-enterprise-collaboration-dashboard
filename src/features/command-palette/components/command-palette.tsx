"use client";

import {
  Building2,
  FileText,
  Kanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  PanelLeft,
  Sun,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { ROUTES } from "@/constants/routes";
import { useLogout } from "@/features/auth/hooks/use-auth";
import { useBoards } from "@/features/boards/hooks/use-boards";
import { useChannels } from "@/features/channels/hooks/use-channels";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { useUiStore } from "@/store/ui-store";
import { useWorkspaceStore } from "@/store/workspace-store";

export function CommandPalette() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const open = useUiStore((state) => state.commandPaletteOpen);
  const setOpen = useUiStore((state) => state.setCommandPaletteOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const setActiveWorkspaceId = useWorkspaceStore(
    (state) => state.setActiveWorkspaceId,
  );
  const logout = useLogout();

  const { data: workspaces = [] } = useWorkspaces();
  const { data: channels = [] } = useChannels(activeWorkspaceId ?? "");
  const { data: boards = [] } = useBoards(activeWorkspaceId ?? "");
  const { data: documents = [] } = useDocuments(activeWorkspaceId ?? "");

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    [setOpen],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Search workspaces, channels, boards, documents…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => router.push(ROUTES.dashboard))}
            >
              <LayoutDashboard />
              Dashboard
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push(ROUTES.workspaces))}
            >
              <Building2 />
              Workspaces
            </CommandItem>
          </CommandGroup>

          {workspaces.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Workspaces">
                {workspaces.map((workspace) => (
                  <CommandItem
                    key={workspace.id}
                    onSelect={() =>
                      runCommand(() => {
                        setActiveWorkspaceId(workspace.id);
                        router.push(ROUTES.workspaceDetail(workspace.id));
                      })
                    }
                  >
                    <Building2 />
                    {workspace.name}
                    {workspace.id === activeWorkspaceId && (
                      <CommandShortcut>Active</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {activeWorkspaceId && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Workspace">
                <CommandItem
                  onSelect={() =>
                    runCommand(() =>
                      router.push(ROUTES.workspaceMembers(activeWorkspaceId)),
                    )
                  }
                >
                  <Users />
                  Members
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() =>
                      router.push(ROUTES.workspaceChannels(activeWorkspaceId)),
                    )
                  }
                >
                  <MessageSquare />
                  Channels
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() =>
                      router.push(ROUTES.workspaceBoards(activeWorkspaceId)),
                    )
                  }
                >
                  <Kanban />
                  Boards
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() =>
                      router.push(ROUTES.workspaceDocuments(activeWorkspaceId)),
                    )
                  }
                >
                  <FileText />
                  Documents
                </CommandItem>
              </CommandGroup>
            </>
          )}

          {channels.length > 0 && (
            <CommandGroup heading="Channels">
              {channels.map((channel) => (
                <CommandItem
                  key={channel.id}
                  value={`channel-${channel.name}`}
                  onSelect={() =>
                    runCommand(() =>
                      router.push(
                        ROUTES.workspaceChannel(activeWorkspaceId!, channel.id),
                      ),
                    )
                  }
                >
                  <MessageSquare />#{channel.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {boards.length > 0 && (
            <CommandGroup heading="Boards">
              {boards.map((board) => (
                <CommandItem
                  key={board.id}
                  value={`board-${board.name}`}
                  onSelect={() =>
                    runCommand(() =>
                      router.push(
                        ROUTES.workspaceBoard(activeWorkspaceId!, board.id),
                      ),
                    )
                  }
                >
                  <Kanban />
                  {board.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {documents.length > 0 && (
            <CommandGroup heading="Documents">
              {documents.map((document) => (
                <CommandItem
                  key={document.id}
                  value={`document-${document.title}`}
                  onSelect={() =>
                    runCommand(() =>
                      router.push(
                        ROUTES.workspaceDocument(
                          activeWorkspaceId!,
                          document.id,
                        ),
                      ),
                    )
                  }
                >
                  <FileText />
                  {document.title || "Untitled"}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => runCommand(toggleSidebar)}>
              <PanelLeft />
              Toggle sidebar
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark"),
                )
              }
            >
              {resolvedTheme === "dark" ? <Sun /> : <Moon />}
              Toggle theme
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => logout.mutate())}
              disabled={logout.isPending}
            >
              <LogOut />
              Sign out
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
