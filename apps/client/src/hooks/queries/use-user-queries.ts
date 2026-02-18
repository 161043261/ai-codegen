import { useQuery } from "@tanstack/react-query";
import request from "@/api/request";
import { queryKeys } from "@/lib/query-client";
import type { BaseResponse, LoginUserVo, PageUserVo } from "@/types";

export function useLoginUser() {
  return useQuery({
    // ["login"]
    queryKey: queryKeys.user.login,
    queryFn: async () => {
      const res = await request<BaseResponse<LoginUserVo>>("/user/get/login", {
        method: "GET",
      });
      if (res.data.code === 0 && res.data.data) {
        return res.data.data;
      }
      return null;
    },
    retry: false,
  });
}

export function useUserVoByPage(params: {
  pageNum: number;
  pageSize: number;
  userAccount?: string;
  userName?: string;
}) {
  return useQuery({
    // ["users", "list", params]
    queryKey: queryKeys.user.listPage(params),
    queryFn: async () => {
      const res = await request<BaseResponse<PageUserVo>>(
        "/user/list/page/vo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          data: params,
        },
      );
      if (res.data.code === 0 && res.data.data) {
        return res.data.data;
      }
      return { records: [], totalRow: 0 } as PageUserVo;
    },
  });
}
