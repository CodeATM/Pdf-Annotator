import axios from "axios";
import env from "@/config/env";
import { TLoginService } from "./types";

class Service {
  login({ payload }: TLoginService) {
    return axios.post(env.api.auth + "/login", payload, {
      withCredentials: true,
    });
  }
  register({ payload }: TLoginService) {
    return axios.post(env.api.auth + "/login", payload, {
      withCredentials: true,
    });
  }
}

const AuthService = new Service();
export default AuthService;
