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
import { useLoginUser } from "@/hooks/apis/auth";
import { useRouter } from "next/navigation";
import { LogininitialValues, LoginValidationSchema } from "@/lib/schema";
import { GoogleAuthButton } from "./google-auth-button";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { onLogin, loading } = useLoginUser();
  const router = useRouter();

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
              <GoogleAuthButton />
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
