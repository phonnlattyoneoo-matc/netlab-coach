"use client";

import { FormEvent, useState } from "react";

const topics = [
  "Networking",
  "PowerShell",
  "Windows Server",
  "Active Directory",
  "Cybersecurity",
];

export default function LearnPage() {
  const [topic, setTopic] = useState(topics[0]);
  const [labQuestion, setLabQuestion] = useState("");
  const [error, setError] = useState("");
  const [showResponse, setShowResponse] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!labQuestion.trim()) {
      setShowResponse(false);
      setError("Please paste your lab question first.");
      return;
    }

    setError("");
    setShowResponse(true);
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <section className="mx-auto flex w-full max-w-3xl flex-col">
        <h1 className="text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
          What lab problem are you working on?
        </h1>

        <form className="mt-10 flex flex-col gap-6" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Topic
            <select
              className="rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 shadow-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/15"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            >
              {topics.map((topic) => (
                <option key={topic}>{topic}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Lab question
            <textarea
              className="min-h-72 resize-y rounded-md border border-slate-300 bg-white px-4 py-3 text-base leading-7 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/15"
              placeholder="Paste your lab question, command output, or error here"
              value={labQuestion}
              onChange={(event) => setLabQuestion(event.target.value)}
            />
          </label>

          <button
            type="submit"
            className="w-fit rounded-md bg-slate-950 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
          >
            Get help
          </button>

          {error ? (
            <p className="text-sm font-medium text-red-600">{error}</p>
          ) : null}
        </form>

        {showResponse ? (
          <section className="mt-10 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-6">
              <ResponseSection
                title="What is happening"
                body={`This looks like a ${topic} lab issue where the system is not producing the result you expected. The mock coach would first restate the symptoms and identify the part of the workflow that seems stuck.`}
              />
              <ResponseSection
                title="Likely cause"
                body="A common cause is a small configuration mismatch, missing prerequisite step, typo, permission issue, or service that has not been started yet."
              />
              <ResponseSection
                title="Step-by-step hint"
                body="Start by reading the exact error message, confirm the command or setting you used, compare it with the lab instructions, and test one change at a time."
              />
              <ResponseSection
                title="Concept explanation"
                body={`In ${topic}, labs usually test the relationship between configuration, verification commands, and expected system behavior. The goal is to connect what you changed with what the system reports back.`}
              />
              <ResponseSection
                title="What to check next"
                body="Check spelling, scope, privileges, service status, network reachability, and whether the previous lab step completed successfully."
              />
              <ResponseSection
                title="Academic integrity note"
                body="Use this guidance to understand the problem and decide your own next step. Do not submit the mock response as your lab answer."
              />
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function ResponseSection({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <article>
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 leading-7 text-slate-600">{body}</p>
    </article>
  );
}
