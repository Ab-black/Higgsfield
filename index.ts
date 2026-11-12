import dotenv from "dotenv";
import { config, higgsfield } from "@higgsfield/client/v2";

// Load credentials from the local, git-ignored .env.local file.
dotenv.config({ path: ".env.local" });

const credentials = process.env.HF_CREDENTIALS?.trim();

if (!credentials) {
  console.error("Missing HF_CREDENTIALS. Copy .env.local.example to .env.local and add your key-id:key-secret locally.");
  process.exit(1);
}

if (!/^[^:]+:.+$/.test(credentials)) {
  console.error("HF_CREDENTIALS must use key-id:key-secret format.");
  process.exit(1);
}

// Credentials are passed directly to the server-side SDK and are never printed.
config({ credentials });

type JobSetResponse = {
  status?: string;
  isCompleted?: boolean;
  isFailed?: boolean;
  isNsfw?: boolean;
  isCanceled?: boolean;
  isCancelled?: boolean;
  video?: { url?: string };
  jobs?: Array<{ results?: { raw?: { url?: string } } }>;
};

async function main(): Promise<void> {
  console.log("Submitting Seedance 2.5 video generation request...");

  try {
    const response = await higgsfield.subscribe(
      "bytedance/seedance-2.5/text-to-video",
      {
        input: {
          prompt: "A cinematic scene at sunset",
          duration: 5,
          resolution: "720p",
          aspect_ratio: "16:9",
          output_format: "mp4",
        },
        withPolling: true,
      },
    );

    // The SDK returns a JobSet; its raw media URL is in jobs[0].results.raw.url.
    const result = response as unknown as JobSetResponse;
    const status = String(result.status ?? "").toLowerCase();

    if (result.isNsfw || status === "nsfw" || status === "moderated" || status === "rejected") {
      throw new Error("The request was blocked by Higgsfield moderation.");
    }

    if (result.isFailed || status === "failed") {
      throw new Error("Higgsfield reported that video generation failed.");
    }

    if (result.isCanceled || result.isCancelled || status === "canceled" || status === "cancelled") {
      throw new Error("The Higgsfield generation request was canceled.");
    }

    if (!(result.isCompleted || status === "completed")) {
      throw new Error(`Generation did not complete successfully (status: ${status || "unknown"}).`);
    }

    const videoUrl = result.jobs?.[0]?.results?.raw?.url ?? result.video?.url;
    if (typeof videoUrl !== "string" || videoUrl.length === 0) {
      throw new Error("Generation completed but the SDK response did not contain a video URL.");
    }

    console.log("Generation completed successfully.");
    console.log(`Video URL: ${videoUrl}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown SDK error.";
    console.error(`Seedance 2.5 generation did not complete: ${message}`);
    process.exitCode = 1;
  }
}

await main();
