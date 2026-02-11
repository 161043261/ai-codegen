/**
 * @deprecated Use hooks from `@/hooks/queries/use-app-queries` and `@/hooks/mutations/use-app-mutations` instead.
 */
import request from "@/api/request";

/** Add app POST /app/add */
export async function addApp(
  body: API.AppAddRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseLong>("/app/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Delete app by admin POST /app/admin/delete */
export async function deleteAppByAdmin(
  body: API.DeleteRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseBoolean>("/app/admin/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Get app VO by id (admin) GET /app/admin/get/vo */
export async function getAppVoByIdByAdmin(
  params: API.getAppVOByIdByAdminParams,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseAppVO>("/app/admin/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** List app VO by page (admin) POST /app/admin/list/page/vo */
export async function listAppVoByPageByAdmin(
  body: API.AppQueryRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponsePageAppVO>("/app/admin/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Update app by admin POST /app/admin/update */
export async function updateAppByAdmin(
  body: API.AppAdminUpdateRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseBoolean>("/app/admin/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Chat to generate code GET /app/chat/gen/code */
export async function chatToGenCode(
  params: API.chatToGenCodeParams,
  options?: { [key: string]: unknown },
) {
  return request<API.ServerSentEventString[]>("/app/chat/gen/code", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** Delete app POST /app/delete */
export async function deleteApp(
  body: API.DeleteRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseBoolean>("/app/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Deploy app POST /app/deploy */
export async function deployApp(
  body: API.AppDeployRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseString>("/app/deploy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Download app code GET /app/download/${param0} */
export async function downloadAppCode(
  params: API.downloadAppCodeParams,
  options?: { [key: string]: unknown },
) {
  const { appId: param0, ...queryParams } = params;
  return request<unknown>(`/app/download/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Get app VO by id GET /app/get/vo */
export async function getAppVoById(
  params: API.getAppVOByIdParams,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseAppVO>("/app/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** List good app VO by page POST /app/good/list/page/vo */
export async function listGoodAppVoByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponsePageAppVO>("/app/good/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** List my app VO by page POST /app/my/list/page/vo */
export async function listMyAppVoByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponsePageAppVO>("/app/my/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Update app POST /app/update */
export async function updateApp(
  body: API.AppUpdateRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseBoolean>("/app/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
