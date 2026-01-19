// !cute command: tags a random active user in the channel

let possibleMessages = [
  "Ur cute ^W^",
  "Cutie detected!",
  "Is that a cutie I see? :3",
  "",
  "",
  "",
  "",
  "",
];

export default {
  name: "cute",
  description: "Tag a random active user in the channel with a cute message!",
  async execute(message) {
    // Get all members in the guild with an active status
    await message.guild.members.fetch(); // Ensure members are cached
    const activeMembers = message.guild.members.cache.filter(
      (member) =>
        !member.user.bot &&
        member.id !== message.author.id &&
        member.presence?.status === "online",
    );
    if (activeMembers.size === 0) {
      return message.channel.send(
        `Hey <@${message.author.id}>, you're super cute today! 🥰 (No other active users found)`,
      );
    }
    const randomMember = activeMembers.random();
    return message.channel.send(
      `Hey <@${randomMember.id}>, you're super cute today! 🥰`,
    );
  },
};
