"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { OTPInput } from "@/components/ui/otp-input";
import { useFormik } from "formik";
import { Loader2, Mail } from "lucide-react";
import { useVerifyOTP, useResendOTP } from "@/hooks/apis/auth";
import { useRouter } from "next/navigation";
import { VerifyinitialValues, VerifyValidationSchema } from "@/lib/schema";

type Props = {
  className?: string;
  email?: string;
  onResendOTP?: () => void;
  resendLoading?: boolean;
};

const VerifyForm = ({
  className,
  email,
  onResendOTP,
  resendLoading,
}: Props) => {
  const { onVerifyOTP, loading } = useVerifyOTP();
  const { onResendOTP: onResendOTPInternal, loading: resendLoadingInternal } =
    useResendOTP();
  const router = useRouter();

  const handleResendOTP = () => {
    if (email) {
      onResendOTPInternal({
        payload: { email },
        successCallback: () => {
          router.push("/auth/dashboard");
        },
      });
    } else {
      onResendOTP?.();
    }
  };

  const formik = useFormik({
    initialValues: VerifyinitialValues,
    validationSchema: VerifyValidationSchema,
    onSubmit: async (values: any, { setSubmitting }: any) => {
      await onVerifyOTP({
        payload: values,
        successCallback: () => {
          router.push("/dashboard");
        },
      });
      setSubmitting(false);
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Verify your email</CardTitle>
          <CardDescription>
            We've sent a verification code to{" "}
            <span className="font-medium text-foreground">
              {email || "your email"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="otp">Enter verification code</Label>
                <OTPInput
                  value={formik.values.token}
                  onChange={(value) => formik.setFieldValue("token", value)}
                  disabled={formik.isSubmitting}
                  className={
                    formik.touched.token && formik.errors.token
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.token && formik.errors.token ? (
                  <p className="text-red-500 text-sm">{formik.errors.token}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={formik.isSubmitting || loading}
              >
                {formik.isSubmitting || loading ? (
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                ) : (
                  "Verify Email"
                )}
              </Button>

              <div className="text-center text-sm">
                <p className="text-muted-foreground mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-sm cursor-pointer "
                  onClick={handleResendOTP}
                  disabled={resendLoading || resendLoadingInternal}
                >
                  {resendLoading || resendLoadingInternal ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : null}
                  Resend verification code
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyForm;
