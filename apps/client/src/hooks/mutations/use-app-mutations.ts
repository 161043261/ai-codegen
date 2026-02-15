import { useMutation, useQueryClient } from "@tanstack/react-query";
import request from "@/api/request";
import { queryKeys } from "@/lib/query-client";

export function useAddAppMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: ApiNs.AppAddRequest) => {
      const res = await request<ApiNs.BaseResponseNumber>("/app/add", {
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
    mutationFn: async (body: ApiNs.AppUpdateRequest) => {
      const res = await request<ApiNs.BaseResponseBoolean>("/app/update", {
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
    mutationFn: async (body: ApiNs.AppAdminUpdateRequest) => {
      const res = await request<ApiNs.BaseResponseBoolean>(
        "/app/admin/update",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          data: body,
        },
      );
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
    mutationFn: async (body: ApiNs.DeleteRequest) => {
      const res = await request<ApiNs.BaseResponseBoolean>("/app/delete", {
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
    mutationFn: async (body: ApiNs.DeleteRequest) => {
      const res = await request<ApiNs.BaseResponseBoolean>(
        "/app/admin/delete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          data: body,
        },
      );
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
    mutationFn: async (body: ApiNs.AppDeployRequest) => {
      const res = await request<ApiNs.BaseResponseString>("/app/deploy", {
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
