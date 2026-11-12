# Higgsfield Seedance 2.5 (TypeScript)

Server-side example using the official `@higgsfield/client` SDK.

## Requirements

- Node.js 20 or newer
- npm
- A Higgsfield API key

## Install

```bash
npm install
```

## Configure credentials locally

Create a local file named `.env.local` in the project root. You can copy the safe template:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and replace the placeholder with your own key in `key-id:key-secret` format:

```dotenv
HF_CREDENTIALS=your-key-id:your-key-secret
```

Do not commit `.env.local`. It is excluded by `.gitignore`. Never put credentials in browser code or paste them into chat.

## Run

```bash
npm run typecheck
npm start
```

The example submits the prompt **“A cinematic scene at sunset”** using Seedance 2.5 text-to-video with a 5-second duration, 720p resolution, and 16:9 aspect ratio. The SDK waits for a terminal result; the script prints the video URL only after a completed response containing a URL.

A generation request may incur charges. Run it only when you are ready to submit a billable request.
