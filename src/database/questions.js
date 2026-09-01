import db from "./db.js";
// insert question
const insertQuestion = db.prepare(`
    INSERT INTO questions
    (avatar, nickname, question_text, weekday, category, question_type, poll_options, allow_multiselect)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const getQuestionStmt = db.prepare(`
    SELECT * FROM questions
    ORDER BY id ASC
    LIMIT 1
`);

const deleteQuestionStmt = db.prepare(`
    DELETE FROM questions
    WHERE id = ?
`);

const updateQuestionCount = db.prepare(`
    UPDATE settings
    SET value = ?
    WHERE key = 'questionNumber'
`);

const getQuestionQueue = db.prepare(`
    SELECT * From questions
    ORDER BY id ASC
    LIMIT 10
`);

export function saveQuestion(avatar, nickname, questionText, weekDay = null, category = null, questionType = "normal", pollOptions = null, allowMultiselect = false) {

    const serializedOptions = Array.isArray(pollOptions) ? JSON.stringify(pollOptions) : null;
    const allowMulti = allowMultiselect ? 1 : 0;

    return insertQuestion.run(avatar, nickname, questionText, weekDay, category, questionType, serializedOptions, allowMulti);
}

//get question
export function getQuestion() {
    return getQuestionStmt.get();
}


//delete question
export function deleteQuestion(id) {
    return deleteQuestionStmt.run(id);
}

export function updateQuestionNumber(newNumber) {
    return updateQuestionCount.run(newNumber);
}

export function getQueue() {
    return getQuestionQueue.all();
}