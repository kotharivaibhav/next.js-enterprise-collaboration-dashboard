"use client";

import { Building2, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import type { Workspace } from "@/types/workspace";
import { useAuthStore } from "@/store/auth-store";

interface WorkspaceCardProps {
  workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const currentUser = useAuthStore((state) => state.user);
  const isOwner = currentUser?.id === workspace.owner_id;

  return (
    <Card className="transition-colors hover:border-primary/30">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">
            <Link
              href={ROUTES.workspaceDetail(workspace.id)}
              className="hover:underline"
            >
              {workspace.name}
            </Link>
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {workspace.description || "No description"}
          </CardDescription>
        </div>
        <Building2 className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{workspace.slug}</Badge>
          {isOwner && <Badge>Owner</Badge>}
        </div>
        <Link
          href={ROUTES.workspaceMembers(workspace.id)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <Users className="size-4" />
          Members
        </Link>
      </CardContent>
    </Card>
  );
}
