import axios from "@/lib/axios";
import env from "@/config/env";
import { TLoginService } from "./types";

class Service {
  login({ payload }: TLoginService) {
    return axios.post(env.api.auth + "/login", payload, {
      withCredentials: true,
    });
  }
  register({ payload }: any) {
    return axios.post(env.api.auth + "/register", payload, {
      withCredentials: true,
    });
  }
  googleAuth() {
    return axios.get(env.api.auth + "/google", {
      withCredentials: true,
    });
  }
  googleAuthCallback({ code }: { code: string }) {
    return axios.post(
      env.api.auth + "/google/callback",
      { code },
      {
        withCredentials: true,
      }
    );
  }
  
  verifyOTP({ payload }: { payload: { otp: string } }) {
    return axios.post(env.api.auth + "/activate-account", payload, {
      withCredentials: true,
    });
  }
  
  resendOTP({ payload }: { payload: { email: string } }) {
    return axios.post(env.api.auth + "/resend-otp", payload, {
      withCredentials: true,
    });
  }
}

const AuthService = new Service();
export default AuthService;
