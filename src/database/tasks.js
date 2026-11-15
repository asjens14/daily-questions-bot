import db from "./db.js";

const insertTask = db.prepare(`
  INSERT INTO tasks (Description, author_name, author_id, priority, target_date, assignee_names, assignee_ids, reminders_sent)
  VALUES (?, ?, ?, ?, ?, ?, ?, '[]')
`);

const getTaskStmt = db.prepare(`
  SELECT * FROM tasks WHERE id = ?
`);

const getAllTasksStmt = db.prepare(`
  SELECT * FROM tasks ORDER BY id ASC
`);

const deleteTaskStmt = db.prepare(`
  DELETE FROM tasks WHERE id = ?
`);

const deleteTaskCommentsStmt = db.prepare(`
  DELETE FROM task_comments WHERE task_id = ?
`);

const updateDateStmt = db.prepare(`
  UPDATE tasks SET target_date = ? WHERE id = ?
`);

const updatePriorityStmt = db.prepare(`
  UPDATE tasks SET priority = ? WHERE id = ?
`);

const updateAssigneesStmt = db.prepare(`
  UPDATE tasks SET assignee_names = ?, assignee_ids = ? WHERE id = ?
`);

const updateRemindersStmt = db.prepare(`
  UPDATE tasks SET reminders_sent = ? WHERE id = ?
`);

const insertTaskCommentStmt = db.prepare(`
  INSERT INTO task_comments (task_id, author, text)
  VALUES (?, ?, ?)
`);

const getTaskCommentsStmt = db.prepare(`
  SELECT * FROM task_comments WHERE task_id = ? ORDER BY id ASC
`);

function parseJsonArray(value, fallback = []) {
  if (value === null || value === undefined || value === "") return fallback;

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch (err) {
    // Ignore malformed JSON and fall back to the base array value.
  }

  return Array.isArray(value) ? value.map(String) : fallback;
}

function normalizeTaskRecord(row) {
  if (!row) return row;

  return {
    ...row,
    description: row.Description ?? row.description ?? "",
    assignee_ids: parseJsonArray(row.assignee_ids, []),
    reminders_sent: parseJsonArray(row.reminders_sent, []),
  };
}

export function createTask(description, authorName, authorId, priority, targetDate, assigneeNames, assigneeIds) {
  const info = insertTask.run(description, authorName, authorId, priority, targetDate ?? null, assigneeNames ?? "", JSON.stringify(assigneeIds ?? []));
  return info.lastInsertRowid;
}

export function getTask(id) {
  const row = getTaskStmt.get(id);
  return normalizeTaskRecord(row);
}

export function getAllTasks() {
  return getAllTasksStmt.all().map(normalizeTaskRecord);
}

export function deleteTask(id) {
  deleteTaskCommentsStmt.run(id);
  return deleteTaskStmt.run(id);
}

export function updateTargetDate(id, newDate) {
  return updateDateStmt.run(newDate, id);
}

export function updatePriority(id, newPriority) {
  return updatePriorityStmt.run(newPriority, id);
}

export function updateAssignees(id, names, ids) {
  return updateAssigneesStmt.run(names, JSON.stringify(ids), id);
}

export function markReminderSent(id, daysLeft, currentReminders) {
  const updatedReminders = [...currentReminders, daysLeft];
  updateRemindersStmt.run(JSON.stringify(updatedReminders), id);
  return updatedReminders;
}

export function addTaskComment(taskId, author, text) {
  return insertTaskCommentStmt.run(taskId, author, text);
}

export function getTaskComments(taskId) {
  return getTaskCommentsStmt.all(taskId);
}