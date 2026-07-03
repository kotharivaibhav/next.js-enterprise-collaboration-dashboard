"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalyticsCharts } from "@/features/analytics/components/analytics-charts";
import { AnalyticsStats } from "@/features/analytics/components/analytics-stats";
import { useGlobalAnalytics } from "@/features/analytics/hooks/use-analytics";
import { formatDistanceToNow } from "@/lib/format-date";
import { useNotificationStore } from "@/store/notification-store";
import Link from "next/link";

export function DashboardPageContent() {
  const { data, isLoading } = useGlobalAnalytics();
  const notifications = useNotificationStore((state) => state.notifications);
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Workspace analytics and recent activity across CollabForge.
        </p>
      </div>

      <AnalyticsStats data={data} isLoading={isLoading} />

      {data && <AnalyticsCharts data={data} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
          <CardDescription>
            Latest notifications from realtime subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Open channels, boards, or documents to receive live notifications.
            </p>
          ) : (
            recentNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.href}
                className="flex items-start justify-between gap-4 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-muted-foreground">{notification.body}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(notification.createdAt)}
                </span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
