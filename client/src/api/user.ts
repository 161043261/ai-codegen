/**
 * @deprecated Use hooks from `@/hooks/queries/use-user-queries` and `@/hooks/mutations/use-user-mutations` instead.
 */
import request from "@/api/request";

/** Add user POST /user/add */
export async function addUser(
  body: API.UserAddRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseLong>("/user/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Delete user POST /user/delete */
export async function deleteUser(
  body: API.DeleteRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseBoolean>("/user/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Get user by id GET /user/get */
export async function getUserById(
  params: API.getUserByIdParams,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseUser>("/user/get", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** Get login user GET /user/get/login */
export async function getLoginUser(options?: { [key: string]: unknown }) {
  return request<API.BaseResponseLoginUserVO>("/user/get/login", {
    method: "GET",
    ...(options || {}),
  });
}

/** Get user VO by id GET /user/get/vo */
export async function getUserVoById(
  params: API.getUserVOByIdParams,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseUserVO>("/user/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** List user VO by page POST /user/list/page/vo */
export async function listUserVoByPage(
  body: API.UserQueryRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponsePageUserVO>("/user/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** User login POST /user/login */
export async function userLogin(
  body: API.UserLoginRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseLoginUserVO>("/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** User logout POST /user/logout */
export async function userLogout(options?: { [key: string]: unknown }) {
  return request<API.BaseResponseBoolean>("/user/logout", {
    method: "POST",
    ...(options || {}),
  });
}

/** User register POST /user/register */
export async function userRegister(
  body: API.UserRegisterRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseLong>("/user/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Update user POST /user/update */
export async function updateUser(
  body: API.UserUpdateRequest,
  options?: { [key: string]: unknown },
) {
  return request<API.BaseResponseBoolean>("/user/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
