import { useMutation, useQueryClient } from "@tanstack/react-query";
import request from "@/api/request";
import { queryKeys } from "@/lib/query-client";
import type { BaseResponse, LoginUserVo, UserRegisterRequest } from "@/types";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      userAccount?: string;
      userPassword?: string;
    }) => {
      const res = await request<BaseResponse<LoginUserVo>>("/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: body,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.code === 0) {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.login });
      }
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (body: UserRegisterRequest) => {
      const res = await request<BaseResponse<number>>("/user/register", {
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
      const res = await request<BaseResponse<boolean>>("/user/logout", {
        method: "POST",
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.code === 0) {
        queryClient.setQueryData(queryKeys.user.login, null);
        queryClient.invalidateQueries({ queryKey: queryKeys.user.login });
      }
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { id?: number }) => {
      const res = await request<BaseResponse<boolean>>("/user/delete", {
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
