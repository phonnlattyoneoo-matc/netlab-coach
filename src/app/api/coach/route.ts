import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ResponseInputContent } from "openai/resources/responses/responses";

const topics = [
  "Networking",
  "PowerShell",
  "Windows Server",
  "Active Directory",
  "Cybersecurity",
] as const;

type Topic = (typeof topics)[number];
const topicGuidance: Record<Topic, string> = {
  Networking:
    "Use examples about VLANs, switch ports, IP addressing, routing, DNS/DHCP, ping tests, interface status, and reading show command output.",
  PowerShell:
    "Use examples about cmdlets, parameters, pipeline output, execution policy, admin permissions, services, files, and network troubleshooting commands.",
  "Windows Server":
    "Use examples about Server Manager, roles and features, DNS, DHCP, file sharing, permissions, Event Viewer, services, and basic server troubleshooting.",
  "Active Directory":
    "Use examples about users, groups, OUs, domain join, Group Policy, permissions, password rules, replication checks, and sign-in troubleshooting.",
  Cybersecurity:
    "Use examples about least privilege, firewall rules, updates, antivirus, logs, account security, suspicious activity, and safe troubleshooting steps.",
};
type CoachResponse = {
  whatIsHappening: string;
  likelyCause: string;
  stepByStepHint: string;
  conceptExplanation: string;
  whatToCheckNext: string;
};

type CoachRequest = {
  topic: Topic;
  question: string;
  screenshot?: {
    dataUrl: string;
    name: string;
  };
};

const openAiApiKey = process.env.OPENAI_API_KEY;
const maxScreenshotSize = 5 * 1024 * 1024;

if (!openAiApiKey) {
  throw new Error("OPENAI_API_KEY is required in the server environment.");
}

const client = new OpenAI({ apiKey: openAiApiKey });

export async function POST(request: Request) {
  let body: CoachRequest | null;

  try {
    body = await parseCoachRequest(request);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Request could not be processed.",
      },
      { status: 400 },
    );
  }

  if (!body || !body.question.trim()) {
    return NextResponse.json(
      { error: "Request must include a valid topic and non-empty question." },
      { status: 400 },
    );
  }

  const topic = body.topic;

  if (!topics.includes(topic)) {
    return NextResponse.json(
      { error: "Topic is not supported." },
      { status: 400 },
    );
  }

  if (!openAiApiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 },
    );
  }

  try {
    const userContent: ResponseInputContent[] = [
      {
        type: "input_text",
        text: `Provide a coaching response for a lab question in the topic '${topic}'. Question: ${body.question.trim()}${
          body.screenshot
            ? ` The student also attached one screenshot named "${body.screenshot.name}". Use visible errors, commands, UI state, and configuration clues from the screenshot as additional context.`
            : ""
        }`,
      },
    ];

    if (body.screenshot) {
      userContent.push({
        type: "input_image",
        image_url: body.screenshot.dataUrl,
        detail: "auto",
      });
    }

    const response = await client.responses.create({
      model: "gpt-5.5",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `You are a lab coaching assistant for IT networking and Windows/network administration labs. Use this topic-specific guidance for ${topic}: ${topicGuidance[topic]} If a screenshot is attached, use it only as context to identify visible error messages, command output, settings, or state that can guide the student's next troubleshooting step. Explain concepts clearly, give step-by-step hints, avoid direct lab answers, and emphasize academic integrity by avoiding any explicit solution or commands that complete the lab for the student. Return only valid JSON with no markdown or extra text.`,
            },
          ],
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "coach_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              whatIsHappening: { type: "string" },
              likelyCause: { type: "string" },
              stepByStepHint: { type: "string" },
              conceptExplanation: { type: "string" },
              whatToCheckNext: { type: "string" },
            },
            required: [
              "whatIsHappening",
              "likelyCause",
              "stepByStepHint",
              "conceptExplanation",
              "whatToCheckNext",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const textResult = response.output_text;
    const parsed = JSON.parse(textResult) as CoachResponse;

    if (
      typeof parsed.whatIsHappening !== "string" ||
      typeof parsed.likelyCause !== "string" ||
      typeof parsed.stepByStepHint !== "string" ||
      typeof parsed.conceptExplanation !== "string" ||
      typeof parsed.whatToCheckNext !== "string"
    ) {
      throw new Error("OpenAI returned an invalid coach response.");
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("OpenAI coach error:", error);
    return NextResponse.json(
      { error: "Failed to generate a coaching response." },
      { status: 500 },
    );
  }
}

async function parseCoachRequest(request: Request): Promise<CoachRequest | null> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const topicValue = formData.get("topic");
    const questionValue = formData.get("question");
    const screenshotValue = formData.get("screenshot");

    if (typeof topicValue !== "string" || typeof questionValue !== "string") {
      return null;
    }

    const topic = topicValue as Topic;
    const coachRequest: CoachRequest = {
      topic,
      question: questionValue,
    };

    if (screenshotValue instanceof File && screenshotValue.size > 0) {
      if (!screenshotValue.type.startsWith("image/")) {
        throw new Error("Screenshot must be an image file.");
      }

      if (screenshotValue.size > maxScreenshotSize) {
        throw new Error("Screenshot must be 5 MB or smaller.");
      }

      coachRequest.screenshot = {
        dataUrl: await fileToDataUrl(screenshotValue),
        name: screenshotValue.name || "attached screenshot",
      };
    }

    return coachRequest;
  }

  const jsonBody = await request.json().catch(() => null);

  if (
    !jsonBody ||
    typeof jsonBody.topic !== "string" ||
    typeof jsonBody.question !== "string"
  ) {
    return null;
  }

  return {
    topic: jsonBody.topic as Topic,
    question: jsonBody.question,
  };
}

async function fileToDataUrl(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return `data:${file.type};base64,${base64}`;
}
