import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { sendDailyQuestion } from "../../utils/sendDailyQuestion.js";

export default {
  data: new SlashCommandBuilder()
    .setName("dqsend")
    .setDescription("Force send the daily question prompt to the channel."),
  async execute(interaction) {
    if (!interaction.member.roles.cache.some((role) => process.env.MOD_ROLE_IDS?.split(",").includes(role.id))) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    
    await interaction.reply({
      content: "Daily question prompt sent.",
      flags: MessageFlags.Ephemeral,
    });
    const displayName =
      interaction.member?.displayName || interaction.user.username;

    const channelId = process.env.DQ_SEND_CHANNEL_ID;
    const channel = await interaction.client.channels.fetch(channelId);
    await sendDailyQuestion(channel);
  },
};
