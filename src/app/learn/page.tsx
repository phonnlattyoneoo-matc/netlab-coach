"use client";

import { FormEvent, useEffect, useState } from "react";

const topics = [
  "Networking",
  "PowerShell",
  "Windows Server",
  "Active Directory",
  "Cybersecurity",
] as const;

type Topic = (typeof topics)[number];

type SavedQuestion = {
  id: string;
  topic: Topic;
  question: string;
  savedAt: string;
};

type FeedbackChoice = "Helpful" | "Not helpful";

type SavedFeedback = {
  id: string;
  topic: Topic;
  question: string;
  feedback: FeedbackChoice;
  savedAt: string;
};

type CoachResponse = {
  whatIsHappening: string;
  likelyCause: string;
  stepByStepHint: string;
  conceptExplanation: string;
  whatToCheckNext: string;
};

const historyStorageKey = "netlab-coach-recent-questions";
const feedbackStorageKey = "netlab-coach-response-feedback";

export default function LearnPage() {
  const [topic, setTopic] = useState<Topic>(topics[0]);
  const [labQuestion, setLabQuestion] = useState("");
  const [error, setError] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<SavedQuestion[]>([]);
  const [responseTopic, setResponseTopic] = useState<Topic>(topics[0]);
  const [responseQuestion, setResponseQuestion] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [response, setResponse] = useState<CoachResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  useEffect(() => {
    const savedHistory = window.localStorage.getItem(historyStorageKey);

    if (!savedHistory) {
      return;
    }

    try {
      const parsedHistory = JSON.parse(savedHistory) as SavedQuestion[];
      setRecentQuestions(parsedHistory.slice(0, 5));
    } catch {
      window.localStorage.removeItem(historyStorageKey);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!labQuestion.trim()) {
      setShowResponse(false);
      setError("Please paste your lab question first.");
      return;
    }

    setError("");
    setFeedbackMessage("");
    setCopyMessage("");
    setResponseTopic(topic);
    setResponseQuestion(labQuestion.trim());
    setIsLoading(true);

    const savedQuestion: SavedQuestion = {
      id: crypto.randomUUID(),
      topic,
      question: labQuestion.trim(),
      savedAt: new Date().toISOString(),
    };
    const updatedHistory = [savedQuestion, ...recentQuestions].slice(0, 5);

    setRecentQuestions(updatedHistory);
    window.localStorage.setItem(
      historyStorageKey,
      JSON.stringify(updatedHistory),
    );

    try {
      const formData = new FormData();
      formData.append("topic", topic);
      formData.append("question", labQuestion.trim());

      if (screenshot) {
        formData.append("screenshot", screenshot);
      }

      const response = await fetch("/api/coach", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error || "Unable to load coaching response.",
        );
      }

      const data = (await response.json()) as CoachResponse;
      setResponse(data);
      setShowResponse(true);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unknown error");
      setShowResponse(false);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClearHistory() {
    setRecentQuestions([]);
    window.localStorage.removeItem(historyStorageKey);
  }

  function handleFeedback(feedback: FeedbackChoice) {
    const savedFeedback: SavedFeedback = {
      id: crypto.randomUUID(),
      topic: responseTopic,
      question: responseQuestion,
      feedback,
      savedAt: new Date().toISOString(),
    };
    const savedFeedbackItems = window.localStorage.getItem(feedbackStorageKey);
    let previousFeedback: SavedFeedback[] = [];

    if (savedFeedbackItems) {
      try {
        previousFeedback = JSON.parse(savedFeedbackItems) as SavedFeedback[];
      } catch {
        window.localStorage.removeItem(feedbackStorageKey);
      }
    }

    window.localStorage.setItem(
      feedbackStorageKey,
      JSON.stringify([savedFeedback, ...previousFeedback]),
    );
    setFeedbackMessage("Thanks for the feedback.");
  }

  function handleScreenshotChange(file: File | null) {
    if (file && !file.type.startsWith("image/")) {
      setScreenshot(null);
      setError("Please attach an image file.");
      return;
    }

    setError("");
    setScreenshot(file);
  }

  async function handleCopyResponse() {
  if (!response) {
    return;
  }

  const textToCopy = [
    `Topic: ${responseTopic}`,
    `Question: ${responseQuestion}`,
    "",
    `What is happening: ${response.whatIsHappening}`,
    `Likely cause: ${response.likelyCause}`,
    `Step-by-step hint: ${response.stepByStepHint}`,
    `Concept explanation: ${response.conceptExplanation}`,
    `What to check next: ${response.whatToCheckNext}`,
    "",
    "Academic integrity note: Use this guidance to understand the problem and decide your own next step.",
  ].join("\n");

  try {
    await navigator.clipboard.writeText(textToCopy);
    setCopyMessage("Copied response.");
  } catch {
    setCopyMessage("Could not copy response.");
  }
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
              onChange={(event) => setTopic(event.target.value as Topic)}
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

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Screenshot
            <input
              className="rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
              type="file"
              accept="image/*"
              onChange={(event) =>
                handleScreenshotChange(event.target.files?.[0] ?? null)
              }
            />
            {screenshot ? (
              <p className="text-sm text-slate-600">
                Selected: {screenshot.name}
              </p>
            ) : null}
          </label>

          <button
            type="submit"
            className="w-fit rounded-md bg-slate-950 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isLoading}
          >
            {isLoading ? "Getting help..." : "Get help"}
          </button>

          {error ? (
            <p className="text-sm font-medium text-red-600">{error}</p>
          ) : null}
        </form>

        {showResponse && response ? (
          <section className="mt-10 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-6">
              <ResponseSection
                title="What is happening"
                body={response.whatIsHappening}
              />
              <ResponseSection
                title="Likely cause"
                body={response.likelyCause}
              />
              <ResponseSection
                title="Step-by-step hint"
                body={response.stepByStepHint}
              />
              <ResponseSection
                title="Concept explanation"
                body={response.conceptExplanation}
              />
              <ResponseSection
                title="What to check next"
                body={response.whatToCheckNext}
              />
              <ResponseSection
                title="Academic integrity note"
                body="Use this guidance to understand the problem and decide your own next step. Do not submit the AI response as your lab answer."
              />
            </div>
<div className="mt-6 flex flex-wrap items-center gap-3">
  <button
    type="button"
    onClick={handleCopyResponse}
    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
  >
    Copy response
  </button>
  {copyMessage ? (
    <p className="text-sm font-medium text-slate-600">{copyMessage}</p>
  ) : null}
</div>
            <div className="mt-8 border-t border-slate-200 pt-6">
              <p className="text-sm font-semibold text-slate-950">
                Was this helpful?
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                  onClick={() => handleFeedback("Helpful")}
                >
                  Helpful
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                  onClick={() => handleFeedback("Not helpful")}
                >
                  Not helpful
                </button>
              </div>
              {feedbackMessage ? (
                <p className="mt-3 text-sm font-medium text-slate-600">
                  {feedbackMessage}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {recentQuestions.length > 0 ? (
          <section className="mt-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold text-slate-950">
                Recent questions
              </h2>
              <button
                type="button"
                className="w-fit rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                onClick={handleClearHistory}
              >
                Clear history
              </button>
            </div>

            <ul className="mt-5 space-y-3">
              {recentQuestions.map((savedQuestion) => (
                <li
                  key={savedQuestion.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {savedQuestion.topic}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                        {getQuestionPreview(savedQuestion.question)}
                      </p>
                    </div>
                    <time className="text-sm text-slate-500">
                      {formatSavedDate(savedQuestion.savedAt)}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function getQuestionPreview(question: string) {
  const compactQuestion = question.replace(/\s+/g, " ").trim();

  if (compactQuestion.length <= 90) {
    return compactQuestion;
  }

  return `${compactQuestion.slice(0, 90)}...`;
}

function formatSavedDate(savedAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(savedAt));
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
