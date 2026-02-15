/**
 * @deprecated Use hooks from `@/hooks/queries/use-app-queries` and `@/hooks/mutations/use-app-mutations` instead.
 */
import request from "@/api/request";

/** Add app POST /app/add */
export async function addApp(
  body: ApiNs.AppAddRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseNumber>("/app/add", {
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
  body: ApiNs.DeleteRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseBoolean>("/app/admin/delete", {
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
  params: ApiNs.GetAppVoByIdByAdminParams,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseAppVo>("/app/admin/get/vo", {
    method: "GET",
    params,
    ...(options ?? {}),
  });
}

/** List appVo by page (admin) POST /app/admin/list/page/vo */
export async function listAppVoByPageByAdmin(
  body: ApiNs.AppQueryRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponsePageAppVo>("/app/admin/list/page/vo", {
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
  body: ApiNs.AppAdminUpdateRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseBoolean>("/app/admin/update", {
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
  params: ApiNs.ChatToGenCodeParams,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.ServerSentEventString[]>("/app/chat/codegen", {
    method: "GET",
    params,
    ...(options ?? {}),
  });
}

/** Delete app POST /app/delete */
export async function deleteApp(
  body: ApiNs.DeleteRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseBoolean>("/app/delete", {
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
  body: ApiNs.AppDeployRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseString>("/app/deploy", {
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
  params: ApiNs.DownloadAppCodeParams,
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
  params: ApiNs.GetAppVoByIdParams,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseAppVo>("/app/get/vo", {
    method: "GET",
    params,
    ...(options ?? {}),
  });
}

/** List awesome appVo by page POST /app/awesome/list/page/vo */
export async function listGoodAppVoByPage(
  body: ApiNs.AppQueryRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponsePageAppVo>("/app/awesome/list/page/vo", {
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
  body: ApiNs.AppQueryRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponsePageAppVo>("/app/my/list/page/vo", {
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
  body: ApiNs.AppUpdateRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseBoolean>("/app/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}
