import { useMutation, useQueryClient } from "@tanstack/react-query";
import request from "@/api/request";
import { queryKeys } from "@/lib/query-client";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: API.UserLoginRequest) => {
      const res = await request<API.BaseResponseLoginUserVO>("/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: body,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.code === 0) {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.loginUser });
      }
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (body: API.UserRegisterRequest) => {
      const res = await request<API.BaseResponseLong>("/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: body,
      });
      return res.data;
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await request<API.BaseResponseBoolean>("/user/logout", {
        method: "POST",
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.code === 0) {
        queryClient.setQueryData(queryKeys.user.loginUser, null);
        queryClient.invalidateQueries({ queryKey: queryKeys.user.loginUser });
      }
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: API.DeleteRequest) => {
      const res = await request<API.BaseResponseBoolean>("/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: body,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.code === 0) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
  });
}
