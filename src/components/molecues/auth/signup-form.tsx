"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterValidationSchema, RegisterinitialValues } from "@/lib/schema";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useRegisterUser } from "@/hooks/apis/auth";
import { GoogleAuthButton } from "./google-auth-button";

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { onRegister, loading } = useRegisterUser();
  const router = useRouter();

  const formik = useFormik({
    initialValues: RegisterinitialValues,
    validationSchema: RegisterValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      await onRegister({
        payload: values,
        successCallback: () => {
          router.push("/auth/verify");
        },
      });
      setSubmitting(false);
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>Sign up with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4">
              <GoogleAuthButton />

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-3">
                <div className="grid gap-3">
                  <Label htmlFor="firstname">Firstname</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.firstName}
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <span className="text-red-500 text-sm">
                      {formik.errors.firstName}
                    </span>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="lastname">Lastname</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.lastName}
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <span className="text-red-500 text-sm">
                      {formik.errors.lastName}
                    </span>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <span className="text-red-500 text-sm">
                      {formik.errors.email}
                    </span>
                  )}
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {/* <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a> */}
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <span className="text-red-500 text-sm">
                      {formik.errors.password}
                    </span>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full mt-3 "
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? (
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  ) : (
                    "Sign up"
                  )}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/auth/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
