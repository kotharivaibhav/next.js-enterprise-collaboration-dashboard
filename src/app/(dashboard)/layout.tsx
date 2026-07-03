"use client";

import { AppShell } from "@/components/layout/app-shell";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Loading your workspace" />
      </div>
    );
  }

  if (isError) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
