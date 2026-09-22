import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { updateQuestionNumber } from "../../database/questions.js";
import permissionCheck from "../../utils/permissionCheck.js";

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
    if (!(await permissionCheck(interaction))) {
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