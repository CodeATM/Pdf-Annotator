import auth from "./auth";
import api from "./api";
import links from "./link";

const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === "production";

const env = {
  api: api(isProduction),
  auth: auth(isProduction),
  links: links(isProduction),
};

export default env;