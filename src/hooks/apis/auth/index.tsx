import { useState } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toasters";
// import { useUpdateAuthContext } from "@/context/AuthContext";
import env from "@/config/env";
import { AxiosError } from "axios";
import AuthService from "@/services/auth";

export const useLoginUser = () => {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  //   const updateAppState = useUpdateAuthContext();

  const onLogin = async ({
    payload,
    successCallback,
  }: {
    payload: { email: string; password: string };
    successCallback?: () => void;
  }) => {
    setLoading(true);
    try {
      const res = await AuthService.login({ payload });
      //   const user = {
      //     user_id: res.data.user_id,
      //     email: res.data.email,
      //     name: res.data.name,
      //   };
      //   updateAppState({
      //     accessToken: res.data.access,
      //     refreshToken: res.data.refresh,
      //     user,
      //   });
      showSuccessToast({
        message: res.data.message || "🚀 Login success!",
        description: res.data.description || "",
      });

      successCallback?.();
      setRedirecting(true);
    } catch (error: Error | AxiosError | any) {
      if (error.response?.status === 400) {
        showErrorToast({
          message: error.response?.data?.Message || "Invalid credentials!",
        });
      } else {
        showErrorToast({
          message: error?.response?.data?.Message || "An error occurred!",
          description: error?.response?.data?.description || "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, onLogin, redirecting };
};
