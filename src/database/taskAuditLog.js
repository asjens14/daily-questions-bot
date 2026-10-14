import db from "./db.js";

const insertLog = db.prepare(`
  INSERT INTO task_audit (task_id, action, user, status, last_known_state)
  VALUES (@task_id, @action, @user, @status, @last_known_state)
`);

export function logAuditAction(task_id, action, user, status = "active", last_known_state = null) {
  return insertLog.run({ task_id, action, user, status, last_known_state: last_known_state ? JSON.stringify(last_known_state) : null });
}