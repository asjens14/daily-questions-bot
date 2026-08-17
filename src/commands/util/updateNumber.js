import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { updateQuestionNumber } from "../../database/questions.js";

export default {
  data: new SlashCommandBuilder()
    .setName("updatenum")
    .setDescription("Update the question number")
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("The new question number")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.member.roles.cache.some((role) => process.env.MOD_ROLE_IDS?.split(",").includes(role.id))) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const newNumber = interaction.options.getInteger("number");
    updateQuestionNumber(newNumber - 1);
    
    await interaction.reply({
      content: `Question number updated to ${newNumber}.`,
      flags: MessageFlags.Ephemeral,
    });
    
  },
};