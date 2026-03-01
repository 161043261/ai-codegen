/**
 * @deprecated Use hooks from `@/hooks/queries/use-app-queries` and `@/hooks/mutations/use-app-mutations` instead.
 */
import request from "@/api/request";
import type {
  AppAdminUpdateRequest,
  AppQueryRequest,
  AppVo,
  BaseResponse,
  PageAppVo,
} from "@/types";

/** Add app POST /app/add */
export async function addApp(
  body: {
    initPrompt?: string;
  },
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<number>>("/app/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}

/** Delete app by admin POST /app/admin/delete */
export async function deleteAppByAdmin(
  body: {
    id?: number;
  },
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<boolean>>("/app/admin/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}

/** Get appVo by id (admin) GET /app/admin/get/vo */
export async function getAppVoByIdByAdmin(
  params: {
    id: number;
  },
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<AppVo>>("/app/admin/get/vo", {
    method: "GET",
    params,
    ...(options ?? {}),
  });
}

/** List appVo by page (admin) POST /app/admin/list/page/vo */
export async function listAppVoByPageByAdmin(
  body: AppQueryRequest,
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<PageAppVo>>("/app/admin/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}

/** Update app by admin POST /app/admin/update */
export async function updateAppByAdmin(
  body: AppAdminUpdateRequest,
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<boolean>>("/app/admin/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}

/** Chat to generate code GET /app/chat/codegen */
export async function chatToGenCode(
  params: {
    appId: number;
    message: string;
  },
  options?: { [key: string]: unknown },
) {
  return request<true[]>("/app/chat/codegen", {
    method: "GET",
    params,
    ...(options ?? {}),
  });
}

/** Delete app POST /app/delete */
export async function deleteApp(
  body: {
    id?: number;
  },
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<boolean>>("/app/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}

/** Deploy app POST /app/deploy */
export async function deployApp(
  body: {
    appId?: number;
  },
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<string>>("/app/deploy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}

/** Download app code GET /app/download/${param0} */
export async function downloadAppCode(
  params: {
    appId: number;
  },
  options?: { [key: string]: unknown },
) {
  const { appId: param0, ...queryParams } = params;
  return request<unknown>(`/app/download/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options ?? {}),
  });
}

/** Get appVo by id GET /app/get/vo */
export async function getAppVoById(
  params: {
    id: number;
  },
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<AppVo>>("/app/get/vo", {
    method: "GET",
    params,
    ...(options ?? {}),
  });
}

/** List awesome appVo by page POST /app/awesome/list/page/vo */
export async function listGoodAppVoByPage(
  body: AppQueryRequest,
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<PageAppVo>>("/app/awesome/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}

/** List my appVo by page POST /app/my/list/page/vo */
export async function listMyAppVoByPage(
  body: AppQueryRequest,
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<PageAppVo>>("/app/my/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}

/** Update app POST /app/update */
export async function updateApp(
  body: {
    id?: number;
    appName?: string;
  },
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<boolean>>("/app/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}
