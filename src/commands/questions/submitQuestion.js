import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { handleQuestionSubmit } from "../../utils/handleQuestionSubmit.js";

const POLL_OPTION_COUNT = 10;

function getPollSubmission(interaction, isPoll) {
  if (!isPoll) {
    return {
      questionType: "normal",
      pollOptions: null,
      allowMultiselect: false,
    };
  }

  const pollOptions = Array.from(
    { length: POLL_OPTION_COUNT },
    (_, index) => interaction.options.getString(`option_${index + 1}`)
  ).filter(Boolean);

  return {
    questionType: "poll",
    pollOptions,
    allowMultiselect: interaction.options.getBoolean("multiselect") ?? false,
  };
}

function getWeekdaySubmission(interaction, subcommand) {
  if (subcommand !== "weekday") {
    return { weekDay: null, category: null };
  }

  return {
    weekDay: interaction.options.getString("week_day"),
    category: interaction.options.getString("category"),
  };
}

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
        .setName("poll")
        .setDescription("Submit a poll question")
        .addStringOption((option) =>
          option
            .setName("question")
            .setDescription("Poll question text")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("option_1")
            .setDescription("First poll option")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("option_2")
            .setDescription("Second poll option")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("option_3")
            .setDescription("Third poll option (optional)")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("option_4")
            .setDescription("Fourth poll option (optional)")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("option_5")
            .setDescription("Fifth poll option (optional)")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("option_6")
            .setDescription("Sixth poll option (optional)")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("option_7")
            .setDescription("Seventh poll option (optional)")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("option_8")
            .setDescription("Eighth poll option (optional)")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("option_9")
            .setDescription("Ninth poll option (optional)")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("option_10")
            .setDescription("Tenth poll option (optional)")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("multiselect")
            .setDescription("Allow choosing multiple answers")
            .setRequired(false)
        )
    )
    // .addSubcommand((subcommand) =>
    //   subcommand
    //     .setName("weekday")
    //     .setDescription("Submit a question for a specific weekday with a category.")
    //     .addStringOption((option) =>
    //       option
    //         .setName("question")
    //         .setDescription("Submit your daily question")
    //         .setRequired(true)
    //     )
    //     .addStringOption((option) =>
    //       option
    //         .setName("category")
    //         .setDescription("Category name for the question")
    //         .setRequired(true)
    //     )
    //     .addStringOption((option) =>
    //       option
    //         .setName("week_day")
    //         .setDescription("(NOT IMPLEMENTED FULLY) Set a specific week day for the question to be sent")
    //         .setRequired(true)
    //         .addChoices(
    //           { name: "Monday", value: "monday" },
    //           { name: "Tuesday", value: "tuesday" },
    //           { name: "Wednesday", value: "wednesday" },
    //           { name: "Thursday", value: "thursday" },
    //           { name: "Friday", value: "friday" },
    //           { name: "Saturday", value: "saturday" },
    //           { name: "Sunday", value: "sunday" }
    //         )
    //     )
    // )
    .setDescription("Submit a question for the daily question prompt."),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const isPoll = subcommand === "poll";
    const questionText = interaction.options.getString("question");
    const displayName = interaction.member?.displayName || interaction.user.username;
    const channelId = process.env.DQ_APPROVAL_CHANNEL_ID;

    const { questionType, pollOptions, allowMultiselect } = getPollSubmission(interaction, isPoll);
    const { weekDay, category } = getWeekdaySubmission(interaction, subcommand);

    await interaction.reply({
      content: "Question Submitted",
      flags: MessageFlags.Ephemeral,
    });
    const channel = await interaction.client.channels.fetch(channelId);

    await handleQuestionSubmit(
      channel,
      interaction.user.avatarURL(),
      displayName,
      questionText,
      weekDay,
      category,
      questionType,
      pollOptions,
      allowMultiselect
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