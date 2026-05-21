"use client";

import { createContext, useContext } from "react";

type QueryRestoreContextValue = {
  isRestoring: boolean;
};

export const QueryRestoreContext = createContext<QueryRestoreContextValue>({
  isRestoring: false,
});

export function useQueryRestore() {
  return useContext(QueryRestoreContext);
}
