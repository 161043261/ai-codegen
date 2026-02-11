import { create } from "zustand";
import { queryClient, queryKeys } from "@/lib/query-client";
import request from "@/api/request";

interface UserState {
  loginUser: API.LoginUserVO;
  fetchLoginUser: () => Promise<void>;
  setLoginUser: (user: API.LoginUserVO) => void;
}

export const useUserStore = create<UserState>((set) => ({
  loginUser: {
    userName: "Not logged in",
  },
  fetchLoginUser: async () => {
    try {
      const res = await request<API.BaseResponseLoginUserVO>(
        "/user/get/login",
        { method: "GET" },
      );
      if (res.data.code === 0 && res.data.data) {
        const user = res.data.data;
        set({ loginUser: user });
        queryClient.setQueryData(queryKeys.user.loginUser, user);
      }
    } catch {
      // Silently fail if not logged in
    }
  },
  setLoginUser: (user) => {
    set({ loginUser: user });
    queryClient.setQueryData(queryKeys.user.loginUser, user);
  },
}));
