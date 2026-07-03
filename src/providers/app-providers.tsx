"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { CommandPalette } from "@/features/command-palette/components/command-palette";
import { useAuthSync } from "@/features/auth/hooks/use-auth-sync";
import { useNotificationListener } from "@/features/notifications/hooks/use-notification-listener";

function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  useAuthSync();
  return <>{children}</>;
}

function RealtimeNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useNotificationListener();
  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthSyncProvider>
          <RealtimeNotificationsProvider>
            {children}
            <CommandPalette />
            <Toaster richColors closeButton position="top-right" />
          </RealtimeNotificationsProvider>
        </AuthSyncProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
