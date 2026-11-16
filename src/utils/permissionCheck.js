import { MessageFlags } from "discord.js";

async function permissionCheck(interaction) {
  const allowedRoleIds = (process.env.MOD_ROLE_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(String);

  if (allowedRoleIds.length === 0) {
    await interaction.reply({
      content: "You do not have permission to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  if (!interaction.member || !interaction.member.roles || !interaction.member.roles.cache) {
    await interaction.reply({
      content: "You do not have permission to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  if (!interaction.member.roles.cache.some((role) => allowedRoleIds.includes(String(role.id)))) {
    await interaction.reply({
      content: "You do not have permission to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  return true;
}

export default permissionCheck;