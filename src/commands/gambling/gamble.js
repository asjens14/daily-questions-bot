import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import generateDisplay from "../../utils/letsGamble.js";
export default {
  data: new SlashCommandBuilder()
    .setName("gamble")
    .setDescription("Lets go gambling!"),
  async execute(interaction) {
    let display = generateDisplay();
      const embed = new EmbedBuilder()
      .setTitle("🎰 Let's Go Gambling! 🎰")
    .setDescription('```\n' + display.slotDisplay + '\n```')
    .setFooter({ text: display.resultText });
    
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
}