// src/utils/taskReminderLoop.js
import cron from "node-cron";
import { getAllTasks, getTaskComments, markReminderSent } from "../database/tasks.js";
import { buildSingleTaskEmbed, notifyUser, parseTargetDate, TASK_CONFIG } from "./taskSystem.js";

function toLocalDateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function startTaskReminderLoop(client) {
  // Every 30 minutes
  cron.schedule("*/30 * * * *", async function () {
    try {
      var tasks = getAllTasks();
      var today = toLocalDateOnly(new Date());

      for (var i = 0; i < tasks.length; i += 1) {
        var task = tasks[i];
        if (task.priority === "Suggestion") continue;

        var targetDate = parseTargetDate(task.target_date || "");
        if (!targetDate) continue;

        var due = toLocalDateOnly(targetDate);
        var daysLeft = Math.round((due - today) / (1000 * 60 * 60 * 24));

        if (!TASK_CONFIG.reminderMilestones.includes(daysLeft)) continue;

        var sent = Array.isArray(task.reminders_sent) ? task.reminders_sent : [];
        if (sent.includes(daysLeft)) continue;

        var ids = Array.isArray(task.assignee_ids) ? task.assignee_ids : [];
        if (ids.length > 0) {
          var comments = getTaskComments(task.id);
          var embed = buildSingleTaskEmbed(task.id, task, comments);
          var dayWord = daysLeft === 0 ? "TODAY" : ("in " + String(daysLeft) + " days");

          for (var j = 0; j < ids.length; j += 1) {
            var uid = ids[j];
            var msg =
              "⏰ **AUTOMATED REMINDER:** Your assigned task (" +
              String(task.id) +
              ") is due **" +
              dayWord +
              "** (" +
              String(task.target_date || "no date") +
              ").";
            await notifyUser(client, uid, msg, embed);
          }
        }

        markReminderSent(task.id, daysLeft, sent);
      }
    } catch (err) {
      console.error("Reminder loop failed:", err);
    }
  });
}