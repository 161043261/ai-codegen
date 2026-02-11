import { useMutation, useQueryClient } from "@tanstack/react-query";
import request from "@/api/request";
import { queryKeys } from "@/lib/query-client";

export function useAddAppMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: API.AppAddRequest) => {
      const res = await request<API.BaseResponseLong>("/app/add", {
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
    mutationFn: async (body: API.AppUpdateRequest) => {
      const res = await request<API.BaseResponseBoolean>("/app/update", {
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
    mutationFn: async (body: API.AppAdminUpdateRequest) => {
      const res = await request<API.BaseResponseBoolean>("/app/admin/update", {
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
    mutationFn: async (body: API.DeleteRequest) => {
      const res = await request<API.BaseResponseBoolean>("/app/delete", {
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
    mutationFn: async (body: API.DeleteRequest) => {
      const res = await request<API.BaseResponseBoolean>("/app/admin/delete", {
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
    mutationFn: async (body: API.AppDeployRequest) => {
      const res = await request<API.BaseResponseString>("/app/deploy", {
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
