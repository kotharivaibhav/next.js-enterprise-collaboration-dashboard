"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GlobalAnalytics } from "@/features/analytics/services/analytics.service";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

interface AnalyticsChartsProps {
  data: GlobalAnalytics;
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const activeStats = data.activeWorkspace;

  const contentDistribution = activeStats
    ? [
        { name: "Channels", value: activeStats.channels },
        { name: "Boards", value: activeStats.boards },
        { name: "Documents", value: activeStats.documents },
        { name: "Cards", value: activeStats.cards },
      ]
    : [];

  const workspaceComparison = data.workspaces.map((workspace) => ({
    name:
      workspace.name.length > 14
        ? `${workspace.name.slice(0, 14)}…`
        : workspace.name,
    total: workspace.channels + workspace.boards + workspace.documents,
    channels: workspace.channels,
    boards: workspace.boards,
    documents: workspace.documents,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active workspace content</CardTitle>
          <CardDescription>
            Distribution of channels, boards, documents, and cards.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {contentDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a workspace to view content distribution.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace comparison</CardTitle>
          <CardDescription>Total content items per workspace.</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {workspaceComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workspaceComparison}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {workspaceComparison.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">No workspaces yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
