import { NextResponse } from "next/server";
import OpenAI from "openai";

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

const openAiApiKey = process.env.OPENAI_API_KEY;

if (!openAiApiKey) {
  throw new Error("OPENAI_API_KEY is required in the server environment.");
}

const client = new OpenAI({ apiKey: openAiApiKey });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.topic !== "string" ||
    typeof body.question !== "string" ||
    !body.question.trim()
  ) {
    return NextResponse.json(
      { error: "Request must include a valid topic and non-empty question." },
      { status: 400 },
    );
  }

  const topic = body.topic as Topic;

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
    const response = await client.responses.create({
      model: "gpt-5.5",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `You are a lab coaching assistant for IT networking and Windows/network administration labs. Use this topic-specific guidance for ${topic}: ${topicGuidance[topic]} Explain concepts clearly, give step-by-step hints, avoid direct lab answers, and emphasize academic integrity by avoiding any explicit solution or commands that complete the lab for the student. Return only valid JSON with no markdown or extra text.`,            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Provide a coaching response for a lab question in the topic '${topic}'. Question: ${body.question.trim()}`,
            },
          ],
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
