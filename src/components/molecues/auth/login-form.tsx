"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import { Loader2 } from "lucide-react";
import { useLoginUser, useGoogleAuth } from "@/hooks/apis/auth";
import { useRouter } from "next/navigation";
import { LogininitialValues, LoginValidationSchema } from "@/lib/schema";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { onLogin, loading } = useLoginUser();
  const router = useRouter();
  const { onGoogleAuth, authLoading } = useGoogleAuth(); // Hook for Google Auth

  const handleGAuth = async () => {
    await onGoogleAuth({
      successCallback: () => {
        router.push("/home");
      },
    });
  };

  const formik = useFormik({
    initialValues: LogininitialValues,
    validationSchema: LoginValidationSchema,
    onSubmit: async (values: any, { setSubmitting }: any) => {
      await onLogin({
        payload: values,
        successCallback: () => {
          router.push("/dashboard");
        },
      });
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleGAuth()}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="mr-2 h-5 w-5"
                      >
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Login with Google
                    </>
                  )}
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...formik.getFieldProps("email")}
                    className={
                      formik.touched.email && formik.errors.email
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <p className="text-red-500 text-sm">
                      {formik.errors.email}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    {...formik.getFieldProps("password")}
                    className={
                      formik.touched.password && formik.errors.password
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.password && formik.errors.password ? (
                    <p className="text-red-500 text-sm">
                      {formik.errors.password}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? (
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a
                  href="/auth/sign-up"
                  className="underline underline-offset-4"
                >
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
