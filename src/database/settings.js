//increment question number
import db from "./db.js";

const getStmt = db.prepare(`
    SELECT value
    FROM settings
    WHERE key = 'questionNumber'
`);

const updateStmt = db.prepare(`
    UPDATE settings
    SET value = ?
    WHERE key = 'questionNumber'
`);

export function incrementQuestionNumber() {
    const current = Number(getStmt.get().value);
    const next = current + 1;

    updateStmt.run(next);

    return next;
}