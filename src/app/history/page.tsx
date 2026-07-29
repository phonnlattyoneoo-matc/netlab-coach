import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type LearningHistoryEntry = {
  id: string | number;
  question: string;
  answer: string;
  created_at: string;
};

type AnswerSection = {
  title: string;
  body: string;
};

const answerFields = [
  ["whatIsHappening", "What is happening"],
  ["likelyCause", "Likely cause"],
  ["stepByStepHint", "Step-by-step hint"],
  ["conceptExplanation", "Concept explanation"],
  ["whatToCheckNext", "What to check next"],
] as const;

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .schema("public")
    .from("learning_history")
    .select("id, question, answer, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load learning history.", {
      code: error.code,
    });
  }

  const history = (data ?? []) as LearningHistoryEntry[];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10 sm:px-6 sm:py-16">
      <section className="mx-auto flex w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-10 lg:p-12">
        <p className="mb-5 w-fit rounded-full bg-slate-950 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
          Saved student progress
        </p>

        <h1 className="text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
          Learning History
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Review your saved lab questions and the coaching guidance you
          received.
        </p>

        <nav
          aria-label="Learning history navigation"
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/dashboard"
            className="w-full rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center text-base font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:w-fit"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/learn"
            className="w-full rounded-xl bg-slate-950 px-6 py-3.5 text-center text-base font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:w-fit"
          >
            Continue Learning
          </Link>
        </nav>

        {error ? (
          <div
            role="alert"
            className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"
          >
            <h2 className="text-lg font-semibold">
              History is temporarily unavailable
            </h2>
            <p className="mt-2 text-sm leading-6">
              We could not load your saved learning history. Please try again
              shortly.
            </p>
          </div>
        ) : history.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center sm:p-8">
            <h2 className="text-xl font-semibold text-slate-950">
              No saved learning history yet
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Ask your first lab question and your completed coaching response
              will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {history.map((entry) => {
              const answerSections = parseSavedAnswer(entry.answer);

              return (
                <article
                  key={entry.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40 sm:p-7"
                >
                  <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Question
                      </p>
                      <h2 className="mt-2 whitespace-pre-wrap break-words text-lg font-semibold leading-7 text-slate-950 sm:text-xl">
                        {entry.question}
                      </h2>
                    </div>
                    <time
                      dateTime={entry.created_at}
                      className="w-fit whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                    >
                      {formatHistoryDate(entry.created_at)}
                    </time>
                  </div>

                  <div className="mt-5 space-y-5">
                    {answerSections.map((section) => (
                      <section key={section.title}>
                        <h3 className="text-sm font-semibold text-slate-950">
                          {section.title}
                        </h3>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                          {section.body}
                        </p>
                      </section>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function parseSavedAnswer(answer: string): AnswerSection[] {
  try {
    const parsed: unknown = JSON.parse(answer);

    if (typeof parsed === "string") {
      return [{ title: "Saved answer", body: parsed }];
    }

    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      const answerObject = parsed as Record<string, unknown>;
      const sections = answerFields.flatMap(([field, title]) => {
        const value = answerObject[field];

        return typeof value === "string" && value.trim().length > 0
          ? [{ title, body: value }]
          : [];
      });

      if (sections.length > 0) {
        return sections;
      }
    }
  } catch {
    // Fall through and display the original value as plain text.
  }

  return [
    {
      title: "Saved answer",
      body: answer || "No saved answer is available.",
    },
  ];
}

function formatHistoryDate(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
