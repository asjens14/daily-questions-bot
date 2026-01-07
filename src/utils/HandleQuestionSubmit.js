import { saveQuestion } from "./saveQuestion.js";

export async function handleQuestionSubmit(avatar, nickname, questionText) {
  console.log("message saved");

  const SEND_TO_MODS = false;

  if (SEND_TO_MODS) {
    sendToMods(avatar, nickname, questionText);
  } else {
    saveQuestion(avatar, nickname, questionText);
  }
}
