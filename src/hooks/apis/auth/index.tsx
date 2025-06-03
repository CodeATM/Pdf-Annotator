import { useState } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toasters";
// import { useUpdateAuthContext } from "@/context/AuthContext";
import env from "@/config/env";
import { AxiosError } from "axios";
import AuthService from "@/services/auth";

export const useLoginUser = () => {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

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

      const { accessToken, refreshToken } = res.data.data;

      // Call the API route to set cookies
      await fetch("/api/auth/setCookies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken, refreshToken }),
      });

      showSuccessToast({
        message: res.data.message || "🚀 Login success!",
        description: res.data.description || "",
      });

      successCallback?.();
      setRedirecting(true);
    } catch (error: any) {
      const apiResponse = error.response?.data || {
        message: "An unknown error occurred",
        description: "",
      };

      showErrorToast({
        message: apiResponse.message,
        description: apiResponse.description,
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, onLogin, redirecting };
};


const useRegisterUser = () => {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const onRegister = async ({
    payload,
    successCallback,
  }: {
    payload: { email: string; password: string };
    successCallback?: () => void;
  }) => {
    setLoading(true);
    try {
      const res = await AuthService.register({ payload });

      const { accessToken, refreshToken } = res.data.data;

      // Call the API route to set cookies
      await fetch("/api/auth/setCookies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken, refreshToken }),
      });

      showSuccessToast({
        message: res.data.message || "🚀 Registration success!",
        description: res.data.description || "",
      });

      successCallback?.();
      setRedirecting(true);
    } catch (error: any) {
      const apiResponse = error.response?.data || {
        message: "An unknown error occurred",
        description: "",
      };

      showErrorToast({
        message: apiResponse.message,
        description: apiResponse.description,
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, onRegister, redirecting };
}
