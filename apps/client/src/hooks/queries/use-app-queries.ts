import { useQuery } from "@tanstack/react-query";
import request from "@/api/request";
import { queryKeys } from "@/lib/query-client";

export function useAppVoById(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.app.byId(id ?? 0),
    queryFn: async () => {
      const res = await request<ApiNs.BaseResponseAppVo>("/app/get/vo", {
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
      const res = await request<ApiNs.BaseResponsePageAppVo>(
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
      return { records: [], totalRow: 0 } as ApiNs.PageAppVo;
    },
    enabled,
  });
}

export function useAwesomeAppVoByPage(params: {
  pageNum: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
}) {
  return useQuery({
    queryKey: queryKeys.app.awesomeList(params),
    queryFn: async () => {
      const res = await request<ApiNs.BaseResponsePageAppVo>(
        "/app/awesome/list/page/vo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          data: params,
        },
      );
      if (res.data.code === 0 && res.data.data) {
        return res.data.data;
      }
      return { records: [], totalRow: 0 } as ApiNs.PageAppVo;
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
      const res = await request<ApiNs.BaseResponsePageAppVo>(
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
      return { records: [], totalRow: 0 } as ApiNs.PageAppVo;
    },
  });
}
