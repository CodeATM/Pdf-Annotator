import axios from "axios";
import env from "@/config/env";
import instance from "@/lib/axios";

class Service {
  myProfile() {
    return instance.get(env.api.user + "/my-account");
  }
//   register({ payload }: any) {
//     return axios.post(env.api.auth + "/register", payload, {
//       withCredentials: true,
//     });
//   }
//   googleAuth() {
//     return axios.get(env.api.auth + "/google", {
//       withCredentials: true,
//     });
//   }
//   googleAuthCallback({ code }: { code: string }) {
//     return axios.post(
//       env.api.auth + "/google/callback",
//       { code },
//       {
//         withCredentials: true,
//       }
//     );
//   }
}

const UserService = new Service();
export default UserService;
