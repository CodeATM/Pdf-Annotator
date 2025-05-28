const links = (isProduction: boolean) => ({
  USER_FRONTEND_URL: process.env.NEXT_PUBLIC_WEBBIE_USER_FRONTEND_URL || "https://default-frontend-url.com",
});

export default links;
