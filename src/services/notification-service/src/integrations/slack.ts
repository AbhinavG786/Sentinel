import axios from "axios";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL!;

export async function sendSlack(message: string) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("Slack webhook URL not configured.");
    return;
  }

  try {
    await axios.post(SLACK_WEBHOOK_URL, {
      text: message,
    });
    console.log("[Slack] Message sent:", message);
  } catch (error) {
    console.error("[Slack] Failed to send message", error);
  }
}