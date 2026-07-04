# NetLab Coach

NetLab Coach is a learning helper for IT and networking students. It helps students think through lab questions, command output, errors, and screenshots in a guided way.

Public site:

```text
https://netlab-coach.vercel.app
```

The app uses the OpenAI API through a Next.js API route. The API key stays server-side in `.env.local` locally and in Vercel environment variables for deployment. The API key is not committed to GitHub.

## Current Features

- Landing page with a link to the learning page
- Learning page at `/learn`
- Topic selector for Networking, PowerShell, Windows Server, Active Directory, and Cybersecurity
- Text box for pasting a lab question, command output, or error
- Optional screenshot upload for lab errors or screenshots
- Screenshot preview before submitting
- Remove screenshot button
- Screenshot validation:
  - Only image files are allowed
  - Maximum file size is 5 MB
  - Invalid files clear the upload input
- Real AI coaching response from the OpenAI API
- AI response sections for:
  - What is happening
  - Likely cause
  - Step-by-step hint
  - Concept explanation
  - What to check next
  - Academic integrity note
- Topic-specific coaching guidance
- Loading state while waiting for the AI response
- Copy response button
- Browser-only recent question history using `localStorage`
- Browser-only Helpful / Not helpful feedback using `localStorage`

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- pnpm
- OpenAI API
- Vercel

## Run Locally

Install dependencies:

```bash
pnpm install
```

Create a local environment file named `.env.local` in the project root:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

Do not commit `.env.local`.

Start the development server:

```bash
pnpm dev
```

Then open:

```text
http://localhost:3000/learn
```

## Deployment

The project is deployed on Vercel:

```text
https://netlab-coach.vercel.app
```

The production `OPENAI_API_KEY` is stored safely in Vercel environment variables.

## Future Plans

- Improve AI coaching prompt quality and topic-specific explanations
- Add safer prompt handling and student-friendly explanations
- Add accounts or saved sessions if needed
- Add persistent storage for history and feedback if needed
- Improve UI polish and accessibility

For now, NetLab Coach is intentionally simple, student-friendly, and useful for guided lab practice.