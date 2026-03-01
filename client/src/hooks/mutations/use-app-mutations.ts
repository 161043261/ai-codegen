import { useMutation, useQueryClient } from "@tanstack/react-query";
import request from "@/api/request";
import { queryKeys } from "@/lib/query-client";
import type { AppAdminUpdateRequest, BaseResponse } from "@/types";

export function useAddAppMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { initPrompt?: string }) => {
      const res = await request<BaseResponse<number>>("/app/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: body,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.code === 0) {
        queryClient.invalidateQueries({ queryKey: ["apps"] });
      }
    },
  });
}

export function useUpdateAppMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { id?: number; appName?: string }) => {
      const res = await request<BaseResponse<boolean>>("/app/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: body,
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      if (data.code === 0 && variables.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.app.byId(variables.id),
        });
        queryClient.invalidateQueries({ queryKey: ["apps"] });
      }
    },
  });
}

export function useUpdateAppByAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: AppAdminUpdateRequest) => {
      const res = await request<BaseResponse<boolean>>("/app/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: body,
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      if (data.code === 0 && variables.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.app.byId(variables.id),
        });
        queryClient.invalidateQueries({ queryKey: ["apps"] });
      }
    },
  });
}

export function useDeleteAppMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { id?: number }) => {
      const res = await request<BaseResponse<boolean>>("/app/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: body,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.code === 0) {
        queryClient.invalidateQueries({ queryKey: ["apps"] });
      }
    },
  });
}

export function useDeleteAppByAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { id?: number }) => {
      const res = await request<BaseResponse<boolean>>("/app/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: body,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.code === 0) {
        queryClient.invalidateQueries({ queryKey: ["apps"] });
      }
    },
  });
}

export function useDeployAppMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { appId?: number }) => {
      const res = await request<BaseResponse<string>>("/app/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: body,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}
