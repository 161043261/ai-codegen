import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Query keys
export const queryKeys = {
  user: {
    login: ["login"] as const,
    listPage: (params: Record<string, unknown>) =>
      ["users", "list", params] as const,
  },
  app: {
    byId: (id: number) => ["app", id] as const,
    myList: (params: Record<string, unknown>) =>
      ["apps", "my", params] as const,
    awesomeList: (params: Record<string, unknown>) =>
      ["apps", "awesome", params] as const,
    adminList: (params: Record<string, unknown>) =>
      ["apps", "admin", params] as const,
  },
  chatHistory: {
    byApp: (appId: number) => ["chatHistory", appId] as const,
    adminList: (params: Record<string, unknown>) =>
      ["chatHistory", "admin", params] as const,
  },
};
