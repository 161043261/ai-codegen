import { useQuery } from "@tanstack/react-query";
import request from "@/api/request";
import { queryKeys } from "@/lib/query-client";

export function useAppVoById(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.app.byId(id!),
    queryFn: async () => {
      const res = await request<API.BaseResponseAppVO>("/app/get/vo", {
        method: "GET",
        params: { id },
      });
      if (res.data.code === 0 && res.data.data) {
        return res.data.data;
      }
      return null;
    },
    enabled: !!id,
  });
}

export function useMyAppVoByPage(
  params: {
    pageNum: number;
    pageSize: number;
    sortField?: string;
    sortOrder?: string;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.app.myList(params),
    queryFn: async () => {
      const res = await request<API.BaseResponsePageAppVO>(
        "/app/my/list/page/vo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          data: params,
        },
      );
      if (res.data.code === 0 && res.data.data) {
        return res.data.data;
      }
      return { records: [], totalRow: 0 } as API.PageAppVO;
    },
    enabled,
  });
}

export function useFeaturedAppVoByPage(params: {
  pageNum: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
}) {
  return useQuery({
    queryKey: queryKeys.app.featuredList(params),
    queryFn: async () => {
      const res = await request<API.BaseResponsePageAppVO>(
        "/app/good/list/page/vo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          data: params,
        },
      );
      if (res.data.code === 0 && res.data.data) {
        return res.data.data;
      }
      return { records: [], totalRow: 0 } as API.PageAppVO;
    },
  });
}

export function useAdminAppVoByPage(params: {
  pageNum: number;
  pageSize: number;
  appName?: string;
  userId?: number;
  codegenType?: string;
}) {
  return useQuery({
    queryKey: queryKeys.app.adminList(params),
    queryFn: async () => {
      const res = await request<API.BaseResponsePageAppVO>(
        "/app/admin/list/page/vo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          data: params,
        },
      );
      if (res.data.code === 0 && res.data.data) {
        return res.data.data;
      }
      return { records: [], totalRow: 0 } as API.PageAppVO;
    },
  });
}
