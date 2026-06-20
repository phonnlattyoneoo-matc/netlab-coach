import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h1 className="text-5xl font-bold tracking-normal text-slate-950 sm:text-6xl">
          NetLab Coach
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 sm:text-xl">
          AI lab helper for IT and networking students
        </p>
        <Link
          href="/learn"
          className="mt-10 rounded-md bg-slate-950 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
        >
          Start learning
        </Link>
      </section>
    </main>
  );
}
