import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { getQueue } from "../../database/questions.js";

function formatQueueEntry(question) {
  const lines = [question.question_text];

  if (question.question_type === "poll") {
    let options = [];

    try {
      options = question.poll_options ? JSON.parse(question.poll_options) : [];
    } catch {
      options = [];
    }

    if (options.length > 0) {
      lines.push("");
      lines.push("Poll options:");
      lines.push(
        ...options.map((option, index) => `${index + 1}. ${option}`)
      );
    }

    if (question.allow_multiselect) {
      lines.push("");
      lines.push("Allows multi-select: yes");
    }
  }

  return lines.join("\n");
}

export default {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("View the current queue of questions."),
  async execute(interaction) {
    if (!interaction.member.roles.cache.some((role) => process.env.MOD_ROLE_IDS?.split(",").includes(role.id))) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const queue = getQueue();
    console.log("Current question queue:", queue);
    const embed = new EmbedBuilder()
      .setTitle("Current Question Queue")
      .setColor(413059);

    if (queue.length === 0) {
      embed.setDescription("The queue is currently empty.");
    } else {
      for (const question of queue) {
        embed.addFields({
          name: `ID: ${question.id} - ${question.nickname}`,
          value: formatQueueEntry(question),
        });
      }
      
    }

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};