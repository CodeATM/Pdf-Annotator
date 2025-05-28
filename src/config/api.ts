const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = (isProduction: boolean) => ({
  auth: `${BASE_URL}/api/v1/auth`,
});

export default api;
