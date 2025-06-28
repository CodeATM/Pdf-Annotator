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
}

const AuthService = new Service();
export default AuthService;
