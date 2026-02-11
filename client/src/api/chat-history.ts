/**
 * @deprecated Use hooks from `@/hooks/queries/use-chat-history-queries` instead.
 */
import request from "@/api/request";

/** List all chat history by page (admin) POST /chatHistory/admin/list/page/vo */
export async function listAllChatHistoryByPageForAdmin(
  body: API.ChatHistoryQueryRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponsePageChatHistory>(
    "/chatHistory/admin/list/page/vo",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** List app chat history GET /chatHistory/app/${param0} */
export async function listAppChatHistory(
  params: API.listAppChatHistoryParams,
  options?: { [key: string]: unknown },
) {
  const { appId: param0, ...queryParams } = params;
  return request<API.BaseResponsePageChatHistory>(
    `/chatHistory/app/${param0}`,
    {
      method: "GET",
      params: {
        pageSize: "10",
        ...queryParams,
      },
      ...(options || {}),
    },
  );
}
