import { useMutation, useQueryClient } from "@tanstack/react-query";
import request from "@/api/request";
import { queryKeys } from "@/lib/query-client";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: ApiNs.UserLoginRequest) => {
      const res = await request<ApiNs.BaseResponseLoginUserVo>("/user/login", {
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
    mutationFn: async (body: ApiNs.UserRegisterRequest) => {
      const res = await request<ApiNs.BaseResponseNumber>("/user/register", {
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
      const res = await request<ApiNs.BaseResponseBoolean>("/user/logout", {
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
    mutationFn: async (body: ApiNs.DeleteRequest) => {
      const res = await request<ApiNs.BaseResponseBoolean>("/user/delete", {
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
