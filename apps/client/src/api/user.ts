/**
 * @deprecated Use hooks from `@/hooks/queries/use-user-queries` and `@/hooks/mutations/use-user-mutations` instead.
 */
import request from "@/api/request";

/** Add user POST /user/add */
export async function addUser(
  body: ApiNs.UserAddRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseNumber>("/user/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}

/** Delete user POST /user/delete */
export async function deleteUser(
  body: ApiNs.DeleteRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseBoolean>("/user/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}

/** Get user by id GET /user/get */
export async function getUserById(
  params: ApiNs.GetUserByIdParams,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseUser>("/user/get", {
    method: "GET",
    params,
    ...(options ?? {}),
  });
}

/** Get login user GET /user/get/login */
export async function getLoginUser(options?: { [key: string]: unknown }) {
  return request<ApiNs.BaseResponseLoginUserVo>("/user/get/login", {
    method: "GET",
    ...(options ?? {}),
  });
}

/** Get userVo by id GET /user/get/vo */
export async function getUserVoById(
  params: ApiNs.GetUserVoByIdParams,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseUserVo>("/user/get/vo", {
    method: "GET",
    params,
    ...(options ?? {}),
  });
}

/** List userVo by page POST /user/list/page/vo */
export async function listUserVoByPage(
  body: ApiNs.UserQueryRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponsePageUserVo>("/user/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}

/** User login POST /user/login */
export async function userLogin(
  body: ApiNs.UserLoginRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseLoginUserVo>("/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}

/** User logout POST /user/logout */
export async function userLogout(options?: { [key: string]: unknown }) {
  return request<ApiNs.BaseResponseBoolean>("/user/logout", {
    method: "POST",
    ...(options ?? {}),
  });
}

/** User register POST /user/register */
export async function userRegister(
  body: ApiNs.UserRegisterRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseNumber>("/user/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}

/** Update user POST /user/update */
export async function updateUser(
  body: ApiNs.UserUpdateRequest,
  options?: { [key: string]: unknown },
) {
  return request<ApiNs.BaseResponseBoolean>("/user/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}
