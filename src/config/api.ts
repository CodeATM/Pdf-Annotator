const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = (isProduction: boolean) => ({
  auth: `${BASE_URL}/api/v1/auth`,
  user: `${BASE_URL}/api/v1/user`,
  file: `${BASE_URL}/api/v1/file`,
  annotation: `${BASE_URL}/api/v1/anon`,
});

export default api;
