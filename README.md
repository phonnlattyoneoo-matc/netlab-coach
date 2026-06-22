# NetLab Coach

NetLab Coach is a simple learning helper for IT and networking students. The goal is to help students think through lab problems, command output, and errors in a guided way.

This version uses the OpenAI API through a Next.js API route. The API key stays server-side in `.env.local` and is not committed to GitHub.

It does not use Supabase, login, database, or screenshot upload yet.

## Current Features

- Landing page with a link to the learning page
- Topic selector for Networking, PowerShell, Windows Server, Active Directory, and Cybersecurity
- Text box for pasting a lab question, command output, or error
- AI coaching response from the OpenAI API with sections for:
  - What is happening
  - Likely cause
  - Step-by-step hint
  - Concept explanation
  - What to check next
  - Academic integrity note
- Topic-specific coaching guidance
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

Create a local environment file named `.env.local` in the project root:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

Do not commit `.env.local`.

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

- Improve AI coaching prompt quality and topic-specific explanations
- Add safer prompt handling and student-friendly explanations
- Add optional screenshot upload for lab errors
- Add accounts or saved sessions if needed
- Add persistent storage for history and feedback
- Improve UI polish and accessibility

For now, NetLab Coach is intentionally simple and local-first.
