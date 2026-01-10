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

    // Fetch the approval channel and pass it to handleQuestionSubmit
    const channelId = process.env.DQ_APPROVAL_CHANNEL_ID;
    const channel = await interaction.client.channels.fetch(channelId);
    await handleQuestionSubmit(
      channel,
      interaction.user.avatarURL(),
      displayName,
      interaction.options.getString("question")
    );
  },
};
