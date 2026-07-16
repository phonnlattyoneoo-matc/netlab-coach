import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10 sm:px-6">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center rounded-3xl border border-slate-200 bg-white/90 px-6 py-14 text-center shadow-xl shadow-slate-200/60 backdrop-blur sm:px-12 sm:py-20">
        <p className="mb-5 w-fit rounded-full bg-slate-950 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
          AI-guided IT lab support
        </p>

        <h1 className="text-5xl font-bold tracking-normal text-slate-950 sm:text-6xl">
          NetLab Coach
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
          Get guided help with lab questions, command output, errors, and
          screenshots while building your own troubleshooting skills.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            Step-by-step hints
          </span>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            Screenshot support
          </span>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            Beginner friendly
          </span>
        </div>

        <Link
          href="/learn"
          className="mt-10 w-full rounded-xl bg-slate-950 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:w-fit"
        >
          Start learning
        </Link>
      </section>
    </main>
  );
}