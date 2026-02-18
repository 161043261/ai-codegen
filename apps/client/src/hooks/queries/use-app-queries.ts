import { useQuery } from "@tanstack/react-query";
import request from "@/api/request";
import { queryKeys } from "@/lib/query-client";
import type { AppVo, BaseResponse, PageAppVo } from "@/types";

export function useAppVoById(id: number | undefined) {
  return useQuery({
    // ["app", id]
    queryKey: queryKeys.app.byId(id ?? 0),
    queryFn: async () => {
      const res = await request<BaseResponse<AppVo>>("/app/get/vo", {
        method: "GET",
        params: { id },
      });
      if (res.data.code === 0 && res.data.data) {
        return res.data.data;
      }
      return null;
    },
    enabled: Boolean(id),
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
    // ["apps", "my", params]
    queryKey: queryKeys.app.myList(params),
    queryFn: async () => {
      const res = await request<BaseResponse<PageAppVo>>(
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
      return { records: [], totalRow: 0 } as PageAppVo;
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
    // ["apps", "awesome", params]
    queryKey: queryKeys.app.awesomeList(params),
    queryFn: async () => {
      const res = await request<BaseResponse<PageAppVo>>(
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
      return { records: [], totalRow: 0 } as PageAppVo;
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
    // ["apps", "admin", params]
    queryKey: queryKeys.app.adminList(params),
    queryFn: async () => {
      const res = await request<BaseResponse<PageAppVo>>(
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
      return { records: [], totalRow: 0 } as PageAppVo;
    },
  });
}
