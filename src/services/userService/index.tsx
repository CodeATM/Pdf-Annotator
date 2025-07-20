import axios from "axios";
import env from "@/config/env";
import instance from "@/lib/axios";

class Service {
  myProfile() {
    return instance.get(env.api.user + "/my-account");
  }
}

const UserService = new Service();
export default UserService;
