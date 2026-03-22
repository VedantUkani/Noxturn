import { Suspense } from "react";
import { LoginPageContent } from "@/components/auth/LoginPageContent";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#04112d] px-4 text-sm text-[#7d89a6]"
          role="status"
          aria-live="polite"
        >
          <span
            className="h-8 w-8 animate-spin rounded-full border-2 border-[#45e0d4]/25 border-t-[#45e0d4]"
            aria-hidden
          />
          <span>Loading</span>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
