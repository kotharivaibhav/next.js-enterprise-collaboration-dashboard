"use client";

import {
  Building2,
  FileText,
  Kanban,
  MessageSquare,
  Users,
  Layers,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { GlobalAnalytics } from "@/features/analytics/services/analytics.service";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
}

function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

interface AnalyticsStatsProps {
  data?: GlobalAnalytics;
  isLoading: boolean;
}

export function AnalyticsStats({ data, isLoading }: AnalyticsStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const active = data?.activeWorkspace;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        title="Workspaces"
        value={data?.workspaceCount ?? 0}
        icon={Building2}
      />
      <StatCard
        title="Members (active)"
        value={active?.members ?? 0}
        icon={Users}
      />
      <StatCard
        title="Channels"
        value={active?.channels ?? 0}
        icon={MessageSquare}
      />
      <StatCard title="Boards" value={active?.boards ?? 0} icon={Kanban} />
      <StatCard
        title="Documents"
        value={active?.documents ?? 0}
        icon={FileText}
      />
      <StatCard title="Cards" value={active?.cards ?? 0} icon={Layers} />
    </div>
  );
}
