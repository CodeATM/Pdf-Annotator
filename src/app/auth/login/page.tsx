"use client";

import { LoginForm } from "@/components/molecues/auth/login-form";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md">
            <img src="/icons/logo.png" alt="" className="rounded-full" />
          </div>
          Annotator
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
