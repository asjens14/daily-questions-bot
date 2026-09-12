import { MessageFlags, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show available commands."),
  async execute(interaction) {
    const embed = {
      title: "Help",
      description: "List of available commands:",
      color: 413059,
      fields: [
        { name: "General use", value: "`/help` `/dq simple` `/dq poll` `/gamble`" },
        { name: "Mod use only", value: "`/dqsend` `/queue` `/updatenum`" },
      ],
    };

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};