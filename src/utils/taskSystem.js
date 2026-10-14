// src/utils/taskSystem.js
import { EmbedBuilder } from "discord.js";

export const TASK_CONFIG = {
  publicChannels: (process.env.TASK_PUBLIC_CHANNEL_IDS || "")
    .split(",")
    .map(function (v) { return v.trim(); })
    .filter(Boolean),
  superUserId: process.env.TASK_SUPER_USER_ID || "",
  allowedRoleIds: (process.env.MOD_ROLE_IDS || "")
    .split(",")
    .map(function (v) { return v.trim(); })
    .filter(Boolean),
  reminderMilestones: [14, 7, 3, 1, 0],
};

export function isHidden(interaction) {
  if (!interaction || !interaction.channelId) return true;
  return !TASK_CONFIG.publicChannels.includes(interaction.channelId);
}

export function hasTaskPermission(interaction) {
  const userId = interaction.user.id;
  if (TASK_CONFIG.superUserId && userId === TASK_CONFIG.superUserId) return true;

  const memberRoles = interaction.member && interaction.member.roles && interaction.member.roles.cache
    ? interaction.member.roles.cache
    : null;

  if (!memberRoles) return false;

  return memberRoles.some(function (role) {
    return TASK_CONFIG.allowedRoleIds.includes(role.id);
  });
}

export function isValidDateFormat(dateStr) {
  // Strict YYYY-MM-DD
  var re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(dateStr)) return false;
  var d = new Date(dateStr + "T00:00:00");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
}

export function parseTargetDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    var ymd = new Date(dateStr + "T00:00:00");
    if (!Number.isNaN(ymd.getTime())) return ymd;
  }

  // MM/DD/YYYY or MM-DD-YYYY (legacy support)
  var mdy = dateStr.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  if (mdy) {
    var month = parseInt(mdy[1], 10) - 1;
    var day = parseInt(mdy[2], 10);
    var year = parseInt(mdy[3], 10);
    var dt = new Date(year, month, day);
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  return null;
}

export function chunkTextByLines(text, maxLength) {
  var limit = maxLength || 1000;
  if (!text || text.length <= limit) return [text || ""];

  var lines = text.split("\n");
  var chunks = [];
  var current = "";

  for (var i = 0; i < lines.length; i += 1) {
    var line = lines[i];
    if (line.length > limit) {
      throw new Error("A single unbroken line exceeds " + String(limit) + " characters.");
    }

    if ((current.length + line.length + 1) > limit) {
      chunks.push(current.trim());
      current = line + "\n";
    } else {
      current += line + "\n";
    }
  }

  if (current) chunks.push(current.trim());

  for (var j = 0; j < chunks.length; j += 1) {
    if (chunks[j].length > limit) {
      throw new Error("Chunk validation failed.");
    }
  }

  return chunks;
}

export function buildSingleTaskEmbed(taskId, task, comments) {
  var prio = task.priority || "Unassigned";
  var embedDesc = "";
  var color = 0x2ecc71;

  if (prio === "Suggestion") {
    embedDesc = "**Priority:** " + prio + "\n**Suggestion:** " + (task.description || "");
    color = 0xf1c40f;
  } else {
    var date = task.target_date || "No date set";
    var assigned = task.assignee_names || "Unassigned";
    embedDesc =
      "**Priority:** " + prio +
      "\n📅 **Target Date:** " + date +
      "\n👥 **Assigned To:** " + assigned +
      "\n**Task:** " + (task.description || "");
  }

  var embed = new EmbedBuilder()
    .setTitle("Task ID: " + String(taskId))
    .setDescription(embedDesc)
    .setColor(color);

  if (!comments || comments.length === 0) {
    embed.addFields({ name: "Comments", value: "*No comments yet.*", inline: false });
  } else {
    for (var i = 0; i < comments.length; i += 1) {
      var c = comments[i];
      embed.addFields({
        name: "Comment #" + String(i + 1) + " - " + (c.author || "Unknown"),
        value: c.text || "",
        inline: false,
      });
    }
  }

  return embed;
}

export function buildTaskListEmbed(tasks, title, color, filterAssigneeId) {
  var high = [];
  var med = [];
  var low = [];
  var unassigned = [];
  var suggestions = [];
  var taskCount = 0;

  for (var i = 0; i < tasks.length; i += 1) {
    var t = tasks[i];
    var ids = Array.isArray(t.assignee_ids) ? t.assignee_ids : [];
    if (filterAssigneeId && !ids.includes(filterAssigneeId)) continue;

    taskCount += 1;
    var prio = t.priority || "Unassigned";
    var desc = t.description || "";
    var author = t.author_name || "Unknown";

    if (prio === "Suggestion") {
      suggestions.push("**" + String(t.id) + "** | " + desc + " *(by " + author + ")*");
      continue;
    }

    var date = t.target_date || "No date set";
    var assigned = t.assignee_names || "Unassigned";
    var row =
      "**" + String(t.id) + "** | " + desc + " *(by " + author + ")* " +
      "📅 **Target:** " + date + " 👥 **Assigned:** " + assigned;

    if (prio === "High") high.push(row);
    else if (prio === "Medium") med.push(row);
    else if (prio === "Low") low.push(row);
    else unassigned.push(row);
  }

  if (taskCount === 0) return null;

  var embed = new EmbedBuilder().setTitle(title).setColor(color);

  function addChunkedField(name, list) {
    if (!list || list.length === 0) return;
    var joined = list.join("\n");
    var chunks = chunkTextByLines(joined, 1000);
    for (var k = 0; k < chunks.length; k += 1) {
      embed.addFields({
        name: k === 0 ? name : (name + " (Cont.)"),
        value: chunks[k],
        inline: false,
      });
    }
  }

  addChunkedField("🔴 High Priority", high);
  addChunkedField("🟡 Medium Priority", med);
  addChunkedField("🟢 Low Priority", low);
  addChunkedField("⚪ Unassigned Priority", unassigned);
  if (!filterAssigneeId) addChunkedField("💡 Suggestions", suggestions);

  return embed;
}

export async function notifyUser(client, userId, content, embed) {
  try {
    var user = await client.users.fetch(userId);
    if (!user) return;
    if (embed) {
      await user.send({ content: content, embeds: [embed] });
    } else {
      await user.send({ content: content });
    }
  } catch (err) {
    console.error("Failed to DM user", userId, err && err.message ? err.message : err);
  }
}