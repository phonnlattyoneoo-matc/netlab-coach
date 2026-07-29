import Link from "next/link";

import { login } from "../actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    success?: string | string[];
  }>;
};

function getMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = getMessage(params.error);
  const successMessage = getMessage(params.success);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10 sm:px-6">
      <section className="mx-auto flex w-full max-w-md flex-col rounded-3xl border border-slate-200 bg-white/90 px-6 py-10 shadow-xl shadow-slate-200/60 backdrop-blur sm:px-10 sm:py-12">
        <p className="mb-5 w-fit rounded-full bg-slate-950 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
          NetLab Coach
        </p>

        <h1 className="text-4xl font-bold tracking-normal text-slate-950">
          Welcome back
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Log in to continue your guided networking practice.
        </p>

        {errorMessage ? (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          >
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p
            role="status"
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
          >
            {successMessage}
          </p>
        ) : null}

        <form
          action={login}
          className="mt-8 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6"
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/15"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 shadow-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/15"
            />
          </label>

          <button
            type="submit"
            className="mt-1 w-full rounded-xl bg-slate-950 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm leading-6 text-slate-600">
          New to NetLab Coach?{" "}
          <Link
            href="/auth/sign-up"
            className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-950"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
