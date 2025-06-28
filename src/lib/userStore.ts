import { create } from "zustand";
import axios from "@/lib/axios";
import { User } from "@/lib/types";
import UserService from "@/services/userService";

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  error: null,
  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      // Adjust the endpoint to your actual user info endpoint
      const res = await UserService.myProfile();
      set({ user: res.data.data, loading: false });
      console.log(res.data.data);
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to fetch user",
        loading: false,
      });
    }
  },
}));
