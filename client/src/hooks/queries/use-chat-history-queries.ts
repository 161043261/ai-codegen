import { useQuery } from "@tanstack/react-query";
import request from "@/api/request";
import { queryKeys } from "@/lib/query-client";
import type { BaseResponse, PageChatHistory } from "@/types";

export function useAppChatHistory(
  appId: number | undefined,
  params?: { pageSize?: number; lastCreateTime?: string },
) {
  return useQuery({
    // ["chatHistory", appId, params]
    queryKey: [...queryKeys.chatHistory.byApp(appId ?? 0), params],
    queryFn: async () => {
      const res = await request<BaseResponse<PageChatHistory>>(
        `/chat-history/app/${appId}`,
        {
          method: "GET",
          params: { pageSize: 10, ...params },
        },
      );
      if (res.data.code === 0 && res.data.data) {
        return res.data.data;
      }
      return { records: [], totalRow: 0 } as PageChatHistory;
    },
    enabled: Boolean(appId),
  });
}

export function useAdminChatHistoryByPage(params: {
  pageNum: number;
  pageSize: number;
  message?: string;
  messageType?: string;
  appId?: number;
  userId?: number;
}) {
  return useQuery({
    // ["chatHistory", "admin", params]
    queryKey: queryKeys.chatHistory.adminList(params),
    queryFn: async () => {
      const res = await request<BaseResponse<PageChatHistory>>(
        "/chat-history/admin/list/page/vo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          data: params,
        },
      );
      if (res.data.code === 0 && res.data.data) {
        return res.data.data;
      }
      return { records: [], totalRow: 0 } as PageChatHistory;
    },
  });
}
