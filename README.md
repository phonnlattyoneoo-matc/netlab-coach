# NetLab Coach

NetLab Coach is a simple learning helper for IT and networking students. The goal is to help students think through lab problems, command output, and errors in a guided way.

This version is mock-only. It does not use the OpenAI API, Supabase, login, database, screenshot upload, or real AI yet.

## Current Mock Features

- Landing page with a link to the learning page
- Topic selector for Networking, PowerShell, Windows Server, Active Directory, and Cybersecurity
- Text box for pasting a lab question, command output, or error
- Mock coaching response with sections for:
  - What is happening
  - Likely cause
  - Step-by-step hint
  - Concept explanation
  - What to check next
  - Academic integrity note
- Topic-specific mock guidance
- Browser-only recent question history using `localStorage`
- Browser-only feedback buttons using `localStorage`

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- pnpm

## Run Locally

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Then open:

```text
http://localhost:3000
```

## Future Plans

- Add real AI coaching when the app is ready for backend integration
- Add safer prompt handling and student-friendly explanations
- Add optional screenshot upload for lab errors
- Add accounts or saved sessions if needed
- Add persistent storage for history and feedback
- Improve UI polish and accessibility

For now, NetLab Coach is intentionally simple and local-first.
