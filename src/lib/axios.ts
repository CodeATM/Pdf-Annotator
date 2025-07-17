import axios from "axios";
import { getCookies } from "./actions/auth";

const instance = axios.create({
  withCredentials: true,
});

instance.interceptors.request.use(
  async (config) => {
    try {
      const { accessToken } = await getCookies();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      } else {
        delete config.headers.Authorization;
      }
    } catch (error) {
      console.error("Error in request interceptor:", error);
    }
    console.log("Request Config:", config);
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 403 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Mark request for retry

      try {
        // Retrieve refresh token from cookies
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        // Request a new access token
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const { accessToken, refreshToken: newRefreshToken } =
          refreshResponse.data.data;

        // // Update cookies with new tokens
        // Cookies.set("accessToken", accessToken, { path: "/" });
        // Cookies.set("refreshToken", newRefreshToken, { path: "/" });

        // Update the Authorization header and retry the original request
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // Optionally: Redirect to login or handle logout
        console.error("Token refresh failed. Redirecting to login...");
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
