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

const historyStorageKey = "netlab-coach-recent-questions";
const feedbackStorageKey = "netlab-coach-response-feedback";

const mockResponses: Record<
  Topic,
  {
    whatIsHappening: string;
    likelyCause: string;
    stepByStepHint: string;
    conceptExplanation: string;
    whatToCheckNext: string;
  }
> = {
  Networking: {
    whatIsHappening:
      "This looks like a networking lab issue where connectivity is not working as expected. The mock coach would focus on ping results, the device IP address, the gateway, DNS, and basic connectivity checks.",
    likelyCause:
      "A likely cause is an incorrect IP address, subnet mask, default gateway, DNS server, or a broken path between devices.",
    stepByStepHint:
      "Start with ping to test local and remote connectivity, then compare the IP address, gateway, and DNS settings against the lab instructions.",
    conceptExplanation:
      "Networking labs often test how IP addressing, routing through a gateway, DNS name resolution, and connectivity checks work together.",
    whatToCheckNext:
      "Check the IP address, subnet mask, gateway, DNS server, cable or adapter state, and whether ping works to the gateway before testing outside networks.",
  },
  PowerShell: {
    whatIsHappening:
      "This looks like a PowerShell lab issue where a command is failing or returning unexpected output. The mock coach would focus on command syntax, execution policy, permissions, and the exact error messages.",
    likelyCause:
      "A likely cause is incorrect command syntax, a missing parameter, a restrictive execution policy, insufficient permissions, or a clue in the error message.",
    stepByStepHint:
      "Read the error message carefully, check the command syntax with help, confirm you are running PowerShell as the right user, and verify execution policy if a script will not run.",
    conceptExplanation:
      "PowerShell labs often test how commands, parameters, permissions, execution policy, and pipeline output fit together.",
    whatToCheckNext:
      "Check spelling, parameter names, execution policy, administrator permissions, module availability, and the full error message before changing the command.",
  },
  "Windows Server": {
    whatIsHappening:
      "This looks like a Windows Server lab issue where a role, service, or server configuration is not behaving as expected. The mock coach would look at roles, services, Event Viewer, and server configuration.",
    likelyCause:
      "A likely cause is a missing role, stopped service, incomplete server configuration, or an error recorded in Event Viewer.",
    stepByStepHint:
      "Confirm the required role is installed, check the related service status, review Event Viewer, and compare the server configuration with the lab steps.",
    conceptExplanation:
      "Windows Server labs often connect installed roles, background services, configuration settings, and Event Viewer logs into one troubleshooting path.",
    whatToCheckNext:
      "Check Server Manager, service status, Event Viewer logs, server configuration, firewall rules, and whether a restart or refresh is required.",
  },
  "Active Directory": {
    whatIsHappening:
      "This looks like an Active Directory lab issue involving users, groups, domain access, permissions, or GPO behavior.",
    likelyCause:
      "A likely cause is the user or group being in the wrong place, a domain connection problem, incorrect permissions, or a GPO that has not applied yet.",
    stepByStepHint:
      "Check the user account, group membership, domain join status, permissions, and whether Group Policy has refreshed.",
    conceptExplanation:
      "Active Directory labs often test how users, groups, domain structure, permissions, and GPO settings control access and behavior.",
    whatToCheckNext:
      "Check users, groups, domain membership, permissions, GPO links, policy inheritance, and whether the client has refreshed policy.",
  },
  Cybersecurity: {
    whatIsHappening:
      "This looks like a cybersecurity lab issue where logs, alerts, firewall behavior, malware indicators, or investigation steps need to be reviewed safely.",
    likelyCause:
      "A likely cause is a firewall rule, suspicious process, malware indicator, missing log detail, or an alert that needs careful triage.",
    stepByStepHint:
      "Start with safe investigation: review logs and alerts, note timestamps, check firewall activity, and avoid running unknown files or commands.",
    conceptExplanation:
      "Cybersecurity labs often test how logs, alerts, firewall rules, malware clues, and safe investigation practices help you understand an incident.",
    whatToCheckNext:
      "Check logs, alert details, firewall rules, malware indicators, affected accounts, and whether your investigation steps preserve evidence safely.",
  },
};

export default function LearnPage() {
  const [topic, setTopic] = useState<Topic>(topics[0]);
  const [labQuestion, setLabQuestion] = useState("");
  const [error, setError] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<SavedQuestion[]>([]);
  const [responseTopic, setResponseTopic] = useState<Topic>(topics[0]);
  const [responseQuestion, setResponseQuestion] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const response = mockResponses[responseTopic];

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!labQuestion.trim()) {
      setShowResponse(false);
      setError("Please paste your lab question first.");
      return;
    }

    setError("");
    setFeedbackMessage("");
    setShowResponse(true);
    setResponseTopic(topic);
    setResponseQuestion(labQuestion.trim());

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
                body="Use this guidance to understand the problem and decide your own next step. Do not submit the mock response as your lab answer."
              />
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
