import { EmbedBuilder } from "discord.js";
import fs from "node:fs/promises";
// import { client } from "../bot.js";
const queuePath = new URL("../../queue.json", import.meta.url);

export async function sendDailyQuestion(channel) {
  console.log("Sending daily question...");
  // const channelId = process.env.DAILY_QUESTION_CHANNEL_ID;
  // if (!channelId) {
  //   console.error("DAILY_QUESTION_CHANNEL_ID not set in .env");
  //   return;
  // }

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

  const embed = new EmbedBuilder()
    .setColor(413059)
    .setTitle(`Daily Question #${data.questionNumber}`)
    .setAuthor({ name: nickname, iconURL: avatar })
    .setDescription(questionText);

  try {
    await channel.send({
      content: `<@&${process.env.PING_ROLE_ID}>`,
      embeds: [embed],
    });
    console.log("Daily question sent!");
  } catch (error) {
    console.error("Failed to send daily question:", error);
  }
}
