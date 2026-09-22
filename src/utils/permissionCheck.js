import { MessageFlags, SlashCommandBuilder } from "discord.js";

async function permissionCheck(interaction) {
  if (!interaction.member.roles.cache.some((role) => process.env.MOD_ROLE_IDS?.split(",").includes(role.id))) {
        await interaction.reply({
          content: "You do not have permission to use this command.",
          flags: MessageFlags.Ephemeral,
        });
        return false;
      }
  return true;
}

export default permissionCheck;