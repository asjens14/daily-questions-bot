import db from "./db.js";
// insert question
const insertQuestion = db.prepare(`
    INSERT INTO questions
    (avatar, nickname, question_text, weekday, category)
    VALUES (?, ?, ?, ?, ?)
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

export function saveQuestion(avatar, nickname, questionText, weekDay = null, category = null) {

    return insertQuestion.run(avatar, nickname, questionText, weekDay, category);
}

//get question
export function getQuestion() {
    return getQuestionStmt.get();
}


//delete question
export function deleteQuestion(id) {
    return deleteQuestionStmt.run(id);
}
