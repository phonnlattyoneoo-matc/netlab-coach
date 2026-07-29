import Link from "next/link";
import { redirect } from "next/navigation";

import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10 sm:px-6">
      <section className="mx-auto flex w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white/90 px-6 py-12 shadow-xl shadow-slate-200/60 backdrop-blur sm:px-10 sm:py-16 lg:px-12">
        <p className="mb-5 w-fit rounded-full bg-slate-950 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
          Authenticated student area
        </p>

        <h1 className="text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
          Student Dashboard
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Continue your guided lab practice and build your troubleshooting
          skills one step at a time.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <p className="text-sm font-medium text-slate-600">Logged in as</p>
          <p className="mt-1 break-all text-base font-semibold text-slate-950 sm:text-lg">
            {user.email ?? "Email unavailable"}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/learn"
            className="w-full rounded-xl bg-slate-950 px-6 py-3.5 text-center text-base font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:w-fit"
          >
            Continue Learning
          </Link>

          <Link
            href="/history"
            className="w-full rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center text-base font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:w-fit"
          >
            View Learning History
          </Link>

          <form action={logout} className="w-full sm:w-fit">
            <button
              type="submit"
              className="w-full rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              Log out
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
