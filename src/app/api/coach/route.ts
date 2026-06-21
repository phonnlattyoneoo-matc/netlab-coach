import { NextResponse } from "next/server";

const topics = [
  "Networking",
  "PowerShell",
  "Windows Server",
  "Active Directory",
  "Cybersecurity",
] as const;

type Topic = (typeof topics)[number];

type CoachResponse = {
  whatIsHappening: string;
  likelyCause: string;
  stepByStepHint: string;
  conceptExplanation: string;
  whatToCheckNext: string;
};

const mockResponses: Record<Topic, CoachResponse> = {
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

  return NextResponse.json(mockResponses[topic]);
}
