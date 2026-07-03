import { useQuery } from "@tanstack/react-query";

import { ANALYTICS_QUERY_KEYS } from "@/features/analytics/constants/query-keys";
import { getGlobalAnalytics } from "@/features/analytics/services/analytics.service";
import { useWorkspaceStore } from "@/store/workspace-store";

export function useGlobalAnalytics() {
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );

  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.global(activeWorkspaceId),
    queryFn: () => getGlobalAnalytics(activeWorkspaceId),
    staleTime: 60_000,
  });
}
