import VerifyForm from "@/components/molecues/auth/Verify-form";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md">
            <img src="/icons/logo.png" alt="" className="rounded-[1000px]" />
          </div>
          Luna
        </a>
        <div className="text-center">
          <p className="text-gray-500 font-[500]">
            Enter the code sent to your email to verify your account.
          </p>
        </div>
        <VerifyForm />
      </div>
    </div>
  );
}
