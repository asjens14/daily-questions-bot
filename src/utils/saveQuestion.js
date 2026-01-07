import fs from "node:fs/promises";
const filePath = new URL("../../queue.json", import.meta.url);

export async function saveQuestion(avatar, nickname, questionText) {
  console.log("Saving question...");
  let data;
  try {
    const file = await fs.readFile(filePath, "utf-8");
    data = JSON.parse(file);
  } catch (err) {
    if (err.code === "ENOENT") {
      data = { questionNumber: 0, questions: [] };
    } else {
      throw err;
    }
  }

  // Add the new question
  data.questions.push({
    avatar,
    nickname,
    questionText,
  });

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
