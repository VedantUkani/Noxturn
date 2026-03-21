export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold">ShiftWeaver Frontend</h1>
      <p className="text-zinc-600">
        Het scaffold ready. Start from onboarding and connect live backend APIs.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <a className="rounded-lg border p-4 hover:bg-zinc-50" href="/onboard">
          Onboard
        </a>
        <a className="rounded-lg border p-4 hover:bg-zinc-50" href="/dashboard">
          Dashboard
        </a>
        <a className="rounded-lg border p-4 hover:bg-zinc-50" href="/sandbox">
          Sandbox
        </a>
      </div>
    </main>
  );
}
