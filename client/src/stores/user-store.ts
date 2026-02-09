import { create } from "zustand";
import { getLoginUser } from "@/api/user";

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
    const res = await getLoginUser();
    if (res.data.code === 0 && res.data.data) {
      set({ loginUser: res.data.data });
    }
  },
  setLoginUser: (user) => set({ loginUser: user }),
}));
