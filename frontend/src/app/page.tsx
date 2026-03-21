import { Suspense } from "react";
import { LoginPageContent } from "@/components/auth/LoginPageContent";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#070b14] text-sm text-slate-500">
          Loading…
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
