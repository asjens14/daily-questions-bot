import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";


import { saveQuestion } from "./saveQuestion.js";

export async function sendToMods(
  channel,
  avatar,
  nickname,
  questionText,
  weekDay = null,
  category = null,
  questionType = "normal",
  pollOptions = null,
  allowMultiselect = false
) {
  const embed = new EmbedBuilder()
    .setColor(413059)
    .setTitle("New Daily Question Submission")
    .setAuthor({ name: nickname, iconURL: avatar })
    .setDescription(questionText);
  if (category) embed.addFields({ name: "Category", value: category });
  if (weekDay) embed.addFields({ name: "Week Day", value: weekDay });
  if (questionType === "poll") {
    embed.addFields({ name: "Type", value: "Poll" });
    if (Array.isArray(pollOptions) && pollOptions.length > 0) {
      embed.addFields({ name: "Poll Options", value: pollOptions.map((option, index) => `${index + 1}. ${option}`).join("\n") });
    }
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("approve")
      .setLabel("Approve")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("reject")
      .setLabel("Reject")
      .setStyle(ButtonStyle.Danger)
  );

  const message = await channel.send({
    embeds: [embed],
    components: [row],
    avatarURL:
      "https://cdn.discordapp.com/avatars/1375237397578649732/9f00a4299abce52f6da33c3a84aaadce.webp?size=128",
    username: "Daily Question Bot",
  });

  const collector = message.createMessageComponentCollector();

  collector.on("collect", async (interaction) => {
    if (interaction.customId === "approve") {
      await interaction.update({
        content: "✅ Approved",
        embeds: [embed],
        components: [],
      });
      await saveQuestion(avatar, nickname, questionText, weekDay, category, questionType, pollOptions, allowMultiselect);
    } else if (interaction.customId === "reject") {
      await interaction.update({
        content: "❌ Rejected",
        embeds: [embed],
        components: [],
      });
    }
  });
}
