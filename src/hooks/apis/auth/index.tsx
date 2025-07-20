import { useState } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toasters";
import AuthService from "@/services/auth";
import { useUserStore } from "@/hooks/stores/userStore";

export const useLoginUser = () => {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const { fetchUser } = useUserStore();

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

      await fetchUser();

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

export const useRegisterUser = () => {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const { fetchUser } = useUserStore();

  const onRegister = async ({
    payload,
    successCallback,
  }: {
    payload: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };
    successCallback?: () => void;
  }) => {
    setLoading(true);
    try {
      const res = await AuthService.register({ payload });

      // // Call the API route to set cookies
      // await fetch("/api/auth/setCookies", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ accessToken, refreshToken }),
      // });

      // await fetchUser();

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
};

export const useGoogleAuth = () => {
  const [authLoading, setAuthLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const onGoogleAuth = async ({
    successCallback,
  }: {
    successCallback?: () => void;
  }) => {
    setAuthLoading(true);
    try {
      // Redirect the user to the backend Google OAuth endpoint
      const authUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/google`;
      console.log("Redirecting to Google OAuth via backend:", authUrl);

      // Redirect to initiate the OAuth flow
      window.location.href = authUrl;
    } catch (error: any) {
      console.error("Error initiating Google OAuth:", error);

      // Show an error toast if the initiation fails
      showErrorToast({
        message: "Failed to start Google authentication process.",
        description: error.message || "An unknown error occurred.",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return { authLoading, redirecting, onGoogleAuth };
};

export const useVerifyOTP = () => {
  const [loading, setLoading] = useState(false);
  const { fetchUser } = useUserStore();

  const onVerifyOTP = async ({
    payload,
    successCallback,
  }: {
    payload: { otp: string };
    successCallback?: () => void;
  }) => {
    setLoading(true);
    try {
      const res = await AuthService.verifyOTP({ payload });

      const { accessToken, refreshToken } = res.data.data;

      // Call the API route to set cookies
      await fetch("/api/auth/setCookies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken, refreshToken }),
      });

      await fetchUser();

      showSuccessToast({
        message: res.data.message || "✅ Verification successful!",
        description: res.data.description || "",
      });

      successCallback?.();
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

  return { loading, onVerifyOTP };
};

export const useResendOTP = () => {
  const [loading, setLoading] = useState(false);

  const onResendOTP = async ({
    payload,
    successCallback,
  }: {
    payload: { email: string };
    successCallback?: () => void;
  }) => {
    setLoading(true);
    try {
      const res = await AuthService.resendOTP({ payload });

      showSuccessToast({
        message: res.data.message || "📧 Verification code resent!",
        description:
          res.data.description || "Please check your email for the new code.",
      });

      successCallback?.();
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

  return { loading, onResendOTP };
};
