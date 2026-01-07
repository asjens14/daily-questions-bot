import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { handleQuestionSubmit } from "../../utils/handleQuestionSubmit.js";

export default {
  data: new SlashCommandBuilder()
    .setName("dq")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Submit your daily question")
        .setRequired(true)
    )
    .setDescription("Submit a question for the daily question prompt."),
  async execute(interaction) {
    await interaction.reply({
      content: "Question Submitted",
      flags: MessageFlags.Ephemeral,
    });
    const displayName =
      interaction.member?.displayName || interaction.user.username;

    await handleQuestionSubmit(
      interaction.user.avatarURL(),
      displayName,
      interaction.options.getString("question")
    );
  },
};
