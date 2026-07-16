"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

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
const maxScreenshotSize = 5 * 1024 * 1024;

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
  const [screenshotError, setScreenshotError] = useState("");
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState("");
  const screenshotInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!screenshot) {
      setScreenshotPreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(screenshot);
    setScreenshotPreviewUrl(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [screenshot]);

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
    if (!file) {
      setScreenshot(null);
      setScreenshotError("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      clearScreenshotInput();
      setScreenshotError("Please choose an image file.");
      return;
    }

    if (file.size > maxScreenshotSize) {
      clearScreenshotInput();
      setScreenshotError(
        "Screenshot is too large. Please choose an image under 5 MB.",
      );
      return;
    }

    setScreenshotError("");
    setScreenshot(file);
  }

  function handleRemoveScreenshot() {
    clearScreenshotInput();
  }

  function clearScreenshotInput() {
    setScreenshot(null);
    setScreenshotError("");

    if (screenshotInputRef.current) {
      screenshotInputRef.current.value = "";
    }
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10 sm:px-6 sm:py-16">
      <section className="mx-auto flex w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-10 lg:p-12">
      <p className="mb-4 w-fit rounded-full bg-slate-950 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
  AI-guided lab help
</p>
        <h1 className="text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
          What lab problem are you working on?
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
  Paste your lab question or upload a screenshot. NetLab Coach will guide
  you through the problem without simply giving away the answer.
</p>

        <form
  className="mt-10 flex flex-col gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6"
  onSubmit={handleSubmit}
>
  <div>
  <h2 className="text-xl font-bold text-slate-950">
    Describe your lab problem
  </h2>
  <p className="mt-1 text-sm leading-6 text-slate-600">
    Choose a topic, paste the question or error, and optionally attach a screenshot.
  </p>
</div>
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
              ref={screenshotInputRef}
              className="rounded-md border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
              type="file"
              accept="image/*"
              onChange={(event) =>
                handleScreenshotChange(event.target.files?.[0] ?? null)
              }
            />
            <p className="text-sm text-slate-500">
              Choose one image file under 5 MB.
            </p>
            {screenshotError ? (
              <p className="text-sm font-medium text-red-600">
                {screenshotError}
              </p>
            ) : null}
            {screenshot && screenshotPreviewUrl ? (
              <div className="flex items-center gap-4 rounded-md border border-slate-200 bg-white p-3">
                <img
                  alt={`Preview of ${screenshot.name}`}
                  className="h-16 w-16 rounded-md border border-slate-200 object-cover"
                  src={screenshotPreviewUrl}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-950">
                    {screenshot.name}
                  </p>
                  <button
                    type="button"
                    className="mt-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                    onClick={handleRemoveScreenshot}
                  >
                    Remove screenshot
                  </button>
                </div>
              </div>
            ) : null}
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-950 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-fit"
          >
            {isLoading ? "Getting help..." : "Get help"}
          </button>

          {error ? (
            <p className="text-sm font-medium text-red-600">{error}</p>
          ) : null}
        </form>

        {showResponse && response ? (
          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-8">
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
    className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:w-fit"
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
                  className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-fit"
                  onClick={() => handleFeedback("Helpful")}
                >
                  Helpful
                </button>
                <button
                  type="button"
                  className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 shadow-sm transition hover:border-red-300 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-fit"
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
          <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold text-slate-950">
                Recent questions
              </h2>
              <button
                type="button"
                className="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-fit"
                onClick={handleClearHistory}
              >
                Clear history
              </button>
            </div>

            <ul className="mt-5 space-y-3">
              {recentQuestions.map((savedQuestion) => (
                <li
                  key={savedQuestion.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="w-fit rounded-full bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                        {savedQuestion.topic}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                        {getQuestionPreview(savedQuestion.question)}
                      </p>
                    </div>
                    <time className="w-fit whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
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
