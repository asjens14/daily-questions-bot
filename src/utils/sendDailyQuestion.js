// This utility will send a daily question to a Discord channel using a webhook

import fetch from "node-fetch";
import fs from "node:fs/promises";
const queuePath = new URL("../../queue.json", import.meta.url);

export async function sendDailyQuestion() {
  console.log("Sending daily question...");
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL not set in .env");
    return;
  }

  // Read the queue
  let data;
  try {
    const file = await fs.readFile(queuePath, "utf-8");
    data = JSON.parse(file);
  } catch (err) {
    console.error("Could not read queue.json:", err);
    return;
  }

  if (!data.questions || data.questions.length === 0) {
    console.log("No questions in the queue.");
    return;
  }

  // Get and remove the first question
  const { avatar, nickname, questionText } = data.questions.shift();
  data.questionNumber = (data.questionNumber || 0) + 1;

  // Save the updated queue
  await fs.writeFile(queuePath, JSON.stringify(data, null, 2), "utf-8");

  // Prepare the payload
  const payload = {
    components: [],
    embeds: [
      {
        color: 413059,
        title: `Daily Question #${data.questionNumber}`,
        author: {
          name: `${nickname}`,
          icon_url: `${avatar}`,
        },
        description: questionText,
      },
    ],
    avatar_url:
      "https://cdn.discordapp.com/avatars/1375237397578649732/9f00a4299abce52f6da33c3a84aaadce.webp?size=128",
    username: "Daily Question Bot",
    content: `<@&${process.env.PING_ROLE_ID}>`, // replace with id of the role
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Error sending webhook: ${response.statusText}`);
    }
    console.log("Daily question sent!");
  } catch (error) {
    console.error("Failed to send daily question:", error);
  }
}
