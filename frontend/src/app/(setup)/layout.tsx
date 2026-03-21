import { SetupTopBar } from "@/components/layout/SetupTopBar";

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#0f172a] text-slate-100">
      <SetupTopBar />
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
