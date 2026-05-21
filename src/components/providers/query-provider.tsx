"use client";

import { QueryRestoreContext } from "@/hooks/use-query-restore";
import {
  createOfflineQueryClient,
  persistQueryClient,
  restoreQueryClient,
  setupQueryPersistence,
} from "@/services/query/query-persistence";
import { setupQueryOnlineManager } from "@/services/query/setup-online-manager";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLayoutEffect, useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState<QueryClient>(() => {
    const queryClient = createOfflineQueryClient();
    if (typeof window !== "undefined") {
      restoreQueryClient(queryClient);
    }
    return queryClient;
  });

  const [isRestored] = useState(() => typeof window !== "undefined");

  useLayoutEffect(() => {
    setupQueryOnlineManager();
    const teardownPersist = setupQueryPersistence(client);

    return () => {
      teardownPersist();
      persistQueryClient(client);
    };
  }, [client]);

  return (
    <QueryRestoreContext.Provider value={{ isRestoring: !isRestored }}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </QueryRestoreContext.Provider>
  );
}
