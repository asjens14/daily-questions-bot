import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { handleQuestionSubmit } from "../../utils/handleQuestionSubmit.js";

export default {
  data: new SlashCommandBuilder()
    .setName("dq")
    .setDescription("Daily question commands")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("simple")
        .setDescription("Submit a question (no category)")
        .addStringOption((option) =>
          option
            .setName("question")
            .setDescription("Submit your daily question")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("weekday")
        .setDescription("Submit a question for a specific weekday with a category.")
        .addStringOption((option) =>
          option
            .setName("question")
            .setDescription("Submit your daily question")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("category")
            .setDescription("Category name for the question")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("week_day")
            .setDescription("Set a specific week day for the question to be sent")
            .setRequired(true)
            .addChoices(
              { name: "Monday", value: "monday" },
              { name: "Tuesday", value: "tuesday" },
              { name: "Wednesday", value: "wednesday" },
              { name: "Thursday", value: "thursday" },
              { name: "Friday", value: "friday" },
              { name: "Saturday", value: "saturday" },
              { name: "Sunday", value: "sunday" }
            )
        )
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

// import { MessageFlags, SlashCommandBuilder } from "discord.js";
// import { handleQuestionSubmit } from "../../utils/handleQuestionSubmit.js";

// export default {
//   data: new SlashCommandBuilder()
//     .setName("dq")
//     .addStringOption((option) =>
//       option
//         .setName("question")
//         .setDescription("Submit your daily question")
//         .setRequired(true)
//     )
//     .addSubcommand((subcommand) =>
//       subcommand
//         .setName("weekday")
//         .setDescription("Set a specific week day for the question to be sent (ex: furry friday)")
//         .addStringOption((option) =>
//           option
//             .setName("day")
//             .setDescription("Choose a day of the week")
//             .setRequired(true)
//             .addChoices(
//               { name: "Monday", value: "monday" },
//               { name: "Tuesday", value: "tuesday" },
//               { name: "Wednesday", value: "wednesday" },
//               { name: "Thursday", value: "thursday" },
//               { name: "Friday", value: "friday" },
//               { name: "Saturday", value: "saturday" },
//               { name: "Sunday", value: "sunday" }
//             )
//         )
//         .addStringOption((option) =>
//           option
//             .setName("category")
//             .setDescription("category (ex: furry friday, thankful thursday, etc)")
//             .setRequired(true)
//       )
//     )
//     .setDescription("Submit a question for the daily question prompt."),
//   async execute(interaction) {
//     await interaction.reply({
//       content: "Question Submitted",
//       flags: MessageFlags.Ephemeral,
//     });
//     const displayName =
//       interaction.member?.displayName || interaction.user.username;

//     // Fetch the approval channel and pass it to handleQuestionSubmit
//     const channelId = process.env.DQ_APPROVAL_CHANNEL_ID;
//     const channel = await interaction.client.channels.fetch(channelId);
//     await handleQuestionSubmit(
//       channel,
//       interaction.user.avatarURL(),
//       displayName,
//       interaction.options.getString("question")
//     );
//   },
// };