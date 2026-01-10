import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

import { saveQuestion } from "./saveQuestion.js";

export async function sendToMods(channel, avatar, nickname, questionText) {
  const embed = new EmbedBuilder()
    .setColor(413059)
    .setTitle("New Daily Question Submission")
    .setAuthor({ name: nickname, iconURL: avatar })
    .setDescription(questionText);

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
      await saveQuestion(avatar, nickname, questionText);
    } else if (interaction.customId === "reject") {
      await interaction.update({
        content: "❌ Rejected",
        embeds: [embed],
        components: [],
      });
    }
  });
}
