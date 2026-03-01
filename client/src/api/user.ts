/**
 * @deprecated Use hooks from `@/hooks/queries/use-user-queries` and `@/hooks/mutations/use-user-mutations` instead.
 */
import request from "@/api/request";
import type {
  BaseResponse,
  LoginUserVo,
  PageUserVo,
  User,
  UserAddRequest,
  UserQueryRequest,
  UserRegisterRequest,
  UserUpdateRequest,
  UserVo,
} from "@/types";

/** Add user POST /user/add */
export async function addUser(
  body: UserAddRequest,
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<number>>("/user/add", {
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
  body: {
    id?: number;
  },
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<boolean>>("/user/delete", {
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
  params: {
    id: number;
  },
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<User>>("/user/get", {
    method: "GET",
    params,
    ...(options ?? {}),
  });
}

/** Get login user GET /user/get/login */
export async function getLoginUser(options?: { [key: string]: unknown }) {
  return request<BaseResponse<LoginUserVo>>("/user/get/login", {
    method: "GET",
    ...(options ?? {}),
  });
}

/** Get userVo by id GET /user/get/vo */
export async function getUserVoById(
  params: {
    id: number;
  },
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<UserVo>>("/user/get/vo", {
    method: "GET",
    params,
    ...(options ?? {}),
  });
}

/** List userVo by page POST /user/list/page/vo */
export async function listUserVoByPage(
  body: UserQueryRequest,
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<PageUserVo>>("/user/list/page/vo", {
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
  body: {
    userAccount?: string;
    userPassword?: string;
  },
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<LoginUserVo>>("/user/login", {
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
  return request<BaseResponse<boolean>>("/user/logout", {
    method: "POST",
    ...(options ?? {}),
  });
}

/** User register POST /user/register */
export async function userRegister(
  body: UserRegisterRequest,
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<number>>("/user/register", {
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
  body: UserUpdateRequest,
  options?: { [key: string]: unknown },
) {
  return request<BaseResponse<boolean>>("/user/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options ?? {}),
  });
}
