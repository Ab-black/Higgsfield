import dotenv from "dotenv";
import { config, higgsfield } from "@higgsfield/client/v2";

// Load credentials from the local, git-ignored .env.local file.
dotenv.config({ path: ".env.local" });

const credentials = process.env.HF_CREDENTIALS?.trim();

if (!credentials) {
  console.error("Missing HF_CREDENTIALS. Copy .env.local.example to .env.local and add your key-id:key-secret locally.");
  process.exit(1);
}

if (!credentials.includes(":")) {
  console.error("HF_CREDENTIALS must use key-id:key-secret format.");
  process.exit(1);
}

// Credentials are passed directly to the server-side SDK and are never printed.
config({ credentials });

async function main(): Promise<void> {
  console.log("Submitting Seedance 2.5 video generation request...");

  try {
    const result = await higgsfield.subscribe(
      "bytedance/seedance-2.5/text-to-video",
      {
        input: {
          prompt: "A cinematic scene at sunset",
          duration: 5,
          resolution: "720p",
          aspect_ratio: "16:9",
        },
        withPolling: true,
      },
    );

    if (result.status !== "completed") {
      const status = String(result.status ?? "unknown").toLowerCase();
      if (status === "failed") {
        throw new Error("Higgsfield reported that the generation failed.");
      }
      if (status === "canceled" || status === "cancelled") {
        throw new Error("The Higgsfield generation was canceled.");
      }
      if (status === "moderated" || status === "rejected") {
        throw new Error("The Higgsfield generation was blocked by moderation.");
      }
      throw new Error(`Generation did not complete successfully (status: ${status}).`);
    }

    const videoUrl = result.video?.url;
    if (typeof videoUrl !== "string" || videoUrl.length === 0) {
      throw new Error("Generation completed but the response did not contain a video URL.");
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
