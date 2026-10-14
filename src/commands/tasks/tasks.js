// src/commands/tasks/taskmaster.js
import { MessageFlags, SlashCommandBuilder } from "discord.js";
import {
  addTaskComment,
  createTask,
  deleteTask,
  getAllTasks,
  getTask,
  getTaskComments,
  updateAssignees,
  updatePriority,
  updateTargetDate,
} from "../../database/tasks.js";
import { logAuditAction } from "../../database/taskAuditLog.js";
import {
  TASK_CONFIG,
  buildSingleTaskEmbed,
  buildTaskListEmbed,
  hasTaskPermission,
  isHidden,
  isValidDateFormat,
  notifyUser,
} from "../../utils/taskSystem.js";

function deny(interaction) {
  return interaction.reply({
    content: "❌ You do not have the required permissions to use this command.",
    flags: MessageFlags.Ephemeral,
  });
}

function getAssigneesFromOptions(interaction, prefix) {
  var first = interaction.options.getUser(prefix);
  var second = interaction.options.getUser(prefix + "_2");
  var third = interaction.options.getUser(prefix + "_3");
  return [first, second, third].filter(Boolean);
}

export default {
  data: new SlashCommandBuilder()
    .setName("task")
    .setDescription("Task management commands")
    .addSubcommand(function (s) {
      return s
        .setName("create")
        .setDescription("Create a task")
        .addStringOption(function (o) { return o.setName("description").setDescription("Task details").setRequired(true); })
        .addStringOption(function (o) {
          return o
            .setName("priority")
            .setDescription("Priority")
            .setRequired(true)
            .addChoices(
              { name: "High 🔴", value: "High" },
              { name: "Medium 🟡", value: "Medium" },
              { name: "Low 🟢", value: "Low" }
            );
        })
        .addStringOption(function (o) { return o.setName("target_date").setDescription("YYYY-MM-DD").setRequired(true); })
        .addUserOption(function (o) { return o.setName("assignee").setDescription("Primary assignee").setRequired(true); })
        .addUserOption(function (o) { return o.setName("assignee_2").setDescription("Optional second assignee").setRequired(false); })
        .addUserOption(function (o) { return o.setName("assignee_3").setDescription("Optional third assignee").setRequired(false); });
    })
    .addSubcommand(function (s) {
      return s
        .setName("suggest")
        .setDescription("Create a suggestion")
        .addStringOption(function (o) { return o.setName("description").setDescription("Suggestion text").setRequired(true); });
    })
    .addSubcommand(function (s) {
      return s.setName("list").setDescription("List active tasks and suggestions");
    })
    .addSubcommand(function (s) {
      return s.setName("mylist").setDescription("List tasks assigned to you");
    })
    .addSubcommand(function (s) {
      return s
        .setName("view")
        .setDescription("View task details")
        .addIntegerOption(function (o) { return o.setName("task_id").setDescription("Task ID").setRequired(true); });
    })
    .addSubcommand(function (s) {
      return s
        .setName("comment")
        .setDescription("Add task comment")
        .addIntegerOption(function (o) { return o.setName("task_id").setDescription("Task ID").setRequired(true); })
        .addStringOption(function (o) { return o.setName("text").setDescription("Comment").setRequired(true); });
    })
    .addSubcommand(function (s) {
      return s
        .setName("update")
        .setDescription("Update date OR assignees OR priority")
        .addIntegerOption(function (o) { return o.setName("task_id").setDescription("Task ID").setRequired(true); })
        .addStringOption(function (o) { return o.setName("new_date").setDescription("YYYY-MM-DD").setRequired(false); })
        .addStringOption(function (o) {
          return o
            .setName("new_priority")
            .setDescription("New priority")
            .setRequired(false)
            .addChoices(
              { name: "High 🔴", value: "High" },
              { name: "Medium 🟡", value: "Medium" },
              { name: "Low 🟢", value: "Low" }
            );
        })
        .addUserOption(function (o) { return o.setName("new_assignee").setDescription("Primary assignee").setRequired(false); })
        .addUserOption(function (o) { return o.setName("new_assignee_2").setDescription("Optional second").setRequired(false); })
        .addUserOption(function (o) { return o.setName("new_assignee_3").setDescription("Optional third").setRequired(false); });
    })
    .addSubcommand(function (s) {
      return s
        .setName("delete")
        .setDescription("Delete a task with reason")
        .addIntegerOption(function (o) { return o.setName("task_id").setDescription("Task ID").setRequired(true); })
        .addStringOption(function (o) { return o.setName("reason").setDescription("Deletion reason").setRequired(true); });
    }),

  async execute(interaction) {
    if (!hasTaskPermission(interaction)) return deny(interaction);

    var sub = interaction.options.getSubcommand();
    var ephemeralFlag = isHidden(interaction) ? MessageFlags.Ephemeral : undefined;

    if (sub === "create") {
      var description = interaction.options.getString("description", true);
      var priority = interaction.options.getString("priority", true);
      var targetDate = interaction.options.getString("target_date", true);
      if (!isValidDateFormat(targetDate)) {
        return interaction.reply({
          content: "❌ Invalid date format. Use YYYY-MM-DD.",
          flags: MessageFlags.Ephemeral,
        });
      }

      var users = getAssigneesFromOptions(interaction, "assignee");
      var names = users.map(function (u) { return u.tag; }).join(", ");
      var ids = users.map(function (u) { return u.id; });

      var taskId = createTask(
        description,
        interaction.user.tag,
        interaction.user.id,
        priority,
        targetDate,
        names,
        ids
      );

      var task = getTask(taskId);
      logAuditAction(
        taskId,
        "Created Task: \"" + description + "\" (Assigned to " + names + ")",
        interaction.user.tag,
        "active",
        task
      );

      var comments = getTaskComments(taskId);
      var embed = buildSingleTaskEmbed(taskId, task, comments);

      for (var i = 0; i < ids.length; i += 1) {
        await notifyUser(interaction.client, ids[i], "🔔 You have been assigned a new task.", embed);
      }

      return interaction.reply({
        content:
          "✅ Task Created.\n" +
          "ID: " + String(taskId) +
          "\nPriority: " + priority +
          "\nTarget Date: " + targetDate +
          "\nAssigned To: " + users.map(function (u) { return "<@" + String(u.id) + ">"; }).join(", ") +
          "\nTask: " + description,
        flags: ephemeralFlag,
      });
    }

    if (sub === "suggest") {
      var suggestionText = interaction.options.getString("description", true);
      var sugId = createTask(
        suggestionText,
        interaction.user.tag,
        interaction.user.id,
        "Suggestion",
        null,
        "",
        []
      );
      var sugTask = getTask(sugId);

      logAuditAction(
        sugId,
        "Created Suggestion: \"" + suggestionText + "\"",
        interaction.user.tag,
        "active",
        sugTask
      );

      return interaction.reply({
        content: "💡 Suggestion Submitted.\nID: " + String(sugId) + "\nSuggestion: " + suggestionText,
        flags: ephemeralFlag,
      });
    }

    if (sub === "list") {
      var tasks = getAllTasks();
      var embedList = buildTaskListEmbed(tasks, "📋 Active Tasks & Suggestions", 0x3498db, null);
      if (!embedList) {
        return interaction.reply({ content: "🎉 No active tasks.", flags: ephemeralFlag });
      }
      return interaction.reply({ embeds: [embedList], flags: ephemeralFlag });
    }

    if (sub === "mylist") {
      var myTasks = getAllTasks();
      var mine = buildTaskListEmbed(myTasks, "📋 Tasks Assigned to You", 0x9b59b6, interaction.user.id);
      if (!mine) {
        return interaction.reply({ content: "🎉 You have no assigned tasks.", flags: ephemeralFlag });
      }
      return interaction.reply({ embeds: [mine], flags: ephemeralFlag });
    }

    if (sub === "view") {
      var taskIdView = interaction.options.getInteger("task_id", true);
      var taskView = getTask(taskIdView);
      if (!taskView) {
        return interaction.reply({ content: "❌ Could not find that task ID.", flags: MessageFlags.Ephemeral });
      }
      var taskComments = getTaskComments(taskIdView);
      var detailEmbed = buildSingleTaskEmbed(taskIdView, taskView, taskComments);
      return interaction.reply({ embeds: [detailEmbed], flags: ephemeralFlag });
    }

    if (sub === "comment") {
      var taskIdComment = interaction.options.getInteger("task_id", true);
      var text = interaction.options.getString("text", true);

      var t = getTask(taskIdComment);
      if (!t) {
        return interaction.reply({ content: "❌ Could not find that task ID.", flags: MessageFlags.Ephemeral });
      }

      addTaskComment(taskIdComment, interaction.user.tag, text);
      var state = getTask(taskIdComment);
      logAuditAction(taskIdComment, "Added comment: \"" + text + "\"", interaction.user.tag, "active", state);

      var notifyIds = Array.isArray(state.assignee_ids) ? state.assignee_ids : [];
      var embedAfterComment = buildSingleTaskEmbed(taskIdComment, state, getTaskComments(taskIdComment));

      for (var c = 0; c < notifyIds.length; c += 1) {
        await notifyUser(
          interaction.client,
          notifyIds[c],
          "💬 New comment on task (" + String(taskIdComment) + ") by " + interaction.user.username + ":\n> " + text,
          embedAfterComment
        );
      }

      return interaction.reply({ content: "💬 Comment added to task " + String(taskIdComment), flags: ephemeralFlag });
    }

    if (sub === "update") {
      var taskIdUpdate = interaction.options.getInteger("task_id", true);
      var taskUpdate = getTask(taskIdUpdate);

      if (!taskUpdate) {
        return interaction.reply({ content: "❌ Could not find that task ID.", flags: MessageFlags.Ephemeral });
      }
      if (taskUpdate.priority === "Suggestion") {
        return interaction.reply({ content: "❌ You cannot update details of a suggestion.", flags: MessageFlags.Ephemeral });
      }

      var newDate = interaction.options.getString("new_date");
      var newPriority = interaction.options.getString("new_priority");
      var newUsers = getAssigneesFromOptions(interaction, "new_assignee");

      var providedDate = !!newDate;
      var providedPriority = !!newPriority;
      var providedAssignees = newUsers.length > 0;
      var groups = Number(providedDate) + Number(providedPriority) + Number(providedAssignees);

      if (groups !== 1) {
        return interaction.reply({
          content: "❌ Provide exactly one update group: date, assignees, or priority.",
          flags: MessageFlags.Ephemeral,
        });
      }

      var updateMsg = "";
      var auditAction = "";
      var oldAssigneeIds = Array.isArray(taskUpdate.assignee_ids) ? taskUpdate.assignee_ids : [];

      if (providedDate) {
        if (!isValidDateFormat(newDate)) {
          return interaction.reply({ content: "❌ Invalid date format. Use YYYY-MM-DD.", flags: MessageFlags.Ephemeral });
        }
        var oldDate = taskUpdate.target_date || "No date set";
        updateTargetDate(taskIdUpdate, newDate);
        updateMsg = "Target date changed from " + oldDate + " to " + newDate;
        auditAction = "Updated target date from " + oldDate + " to " + newDate;
      } else if (providedPriority) {
        var oldPrio = taskUpdate.priority || "Unassigned";
        updatePriority(taskIdUpdate, newPriority);
        updateMsg = "Priority changed from " + oldPrio + " to " + newPriority;
        auditAction = "Updated priority from " + oldPrio + " to " + newPriority;
      } else {
        var newNames = newUsers.map(function (u) { return u.tag; }).join(", ");
        var newIds = newUsers.map(function (u) { return u.id; });
        var oldNames = taskUpdate.assignee_names || "Unassigned";
        updateAssignees(taskIdUpdate, newNames, newIds);
        updateMsg = "Assignees changed from " + oldNames + " to " + newNames;
        auditAction = "Updated assignees from " + oldNames + " to " + newNames;
      }

      addTaskComment(taskIdUpdate, "System Auto-Log", "⚙️ " + updateMsg + " by " + interaction.user.username + ".");
      var post = getTask(taskIdUpdate);
      logAuditAction(taskIdUpdate, auditAction, interaction.user.tag, "active", post);

      var postIds = Array.isArray(post.assignee_ids) ? post.assignee_ids : [];
      var postEmbed = buildSingleTaskEmbed(taskIdUpdate, post, getTaskComments(taskIdUpdate));

      if (providedAssignees) {
        for (var o = 0; o < oldAssigneeIds.length; o += 1) {
          if (!postIds.includes(oldAssigneeIds[o])) {
            await notifyUser(
              interaction.client,
              oldAssigneeIds[o],
              "ℹ️ You were unassigned from task " + String(taskIdUpdate) + ".",
              null
            );
          }
        }

        for (var n = 0; n < postIds.length; n += 1) {
          await notifyUser(
            interaction.client,
            postIds[n],
            "⚙️ Task update for task " + String(taskIdUpdate) + ".",
            postEmbed
          );
        }
      } else {
        for (var p = 0; p < postIds.length; p += 1) {
          await notifyUser(
            interaction.client,
            postIds[p],
            "⚙️ A detail changed for your task " + String(taskIdUpdate) + ":\n> " + updateMsg,
            postEmbed
          );
        }
      }

      return interaction.reply({ content: "✅ Task updated: " + updateMsg, flags: ephemeralFlag });
    }

    if (sub === "delete") {
      var taskIdDelete = interaction.options.getInteger("task_id", true);
      var reason = interaction.options.getString("reason", true);
      var taskDelete = getTask(taskIdDelete);

      if (!taskDelete) {
        return interaction.reply({ content: "❌ Could not find that task ID.", flags: MessageFlags.Ephemeral });
      }

      var isAuthor = String(interaction.user.id) === String(taskDelete.author_id);
      var isOwner = TASK_CONFIG.superUserId && String(interaction.user.id) === String(TASK_CONFIG.superUserId);
      var isSteward = interaction.member.roles.cache.some(function (role) {
        return TASK_CONFIG.allowedRoleIds.includes(role.id);
      });

      if (!isAuthor && !isOwner && !isSteward) {
        return interaction.reply({
          content: "❌ Only the author, super user, or allowed steward role can delete this task.",
          flags: MessageFlags.Ephemeral,
        });
      }

      addTaskComment(taskIdDelete, "System Auto-Log", "🗑️ DELETED by " + interaction.user.username + ". Reason: " + reason);
      var finalState = getTask(taskIdDelete);
      logAuditAction(taskIdDelete, "Deleted item. Reason: \"" + reason + "\"", interaction.user.tag, "deleted", finalState);

      var idsDel = Array.isArray(taskDelete.assignee_ids) ? taskDelete.assignee_ids : [];
      var deletedDescription = taskDelete.description || "Unknown description";

      deleteTask(taskIdDelete);

      for (var d = 0; d < idsDel.length; d += 1) {
        await notifyUser(
          interaction.client,
          idsDel[d],
          "🗑️ Task canceled: task " + String(taskIdDelete) + " was deleted by " + interaction.user.username +
            ".\nReason: " + reason + "\nTask: " + deletedDescription,
          null
        );
      }

      return interaction.reply({
        content: "🗑️ Task " + String(taskIdDelete) + " deleted.\nReason: " + reason,
        flags: ephemeralFlag,
      });
    }

    return interaction.reply({ content: "Unknown task subcommand.", flags: MessageFlags.Ephemeral });
  },
};