import { create } from "zustand";
import request from "@/api/request";
import { queryClient, queryKeys } from "@/lib/query-client";
import type { BaseResponse, LoginUserVo } from "@/types";

interface UserState {
  loginUser: LoginUserVo;
  fetchLoginUser: () => Promise<void>;
  setLoginUser: (user: LoginUserVo) => void;
}

export const useUserStore = create<UserState>((set) => ({
  loginUser: {
    userName: "Not logged in",
  },
  fetchLoginUser: async () => {
    try {
      const res = await request<BaseResponse<LoginUserVo>>("/user/get/login", {
        method: "GET",
      });
      if (res.data.code === 0 && res.data.data) {
        const user = res.data.data;
        set({ loginUser: user });
        queryClient.setQueryData(queryKeys.user.login, user);
      }
    } catch {
      // Silently fail if not logged in
    }
  },
  setLoginUser: (user) => {
    set({ loginUser: user });
    queryClient.setQueryData(queryKeys.user.login, user);
  },
}));
