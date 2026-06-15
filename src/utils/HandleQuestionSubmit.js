import { saveQuestion } from "./saveQuestion.js";
import { sendToMods } from "./sendToMods.js";

export async function handleQuestionSubmit(
  channel,
  avatar,
  nickname,
  questionText,
  weekDay = null,
  category = null
) {
  console.log("message saved");

  const SEND_TO_MODS = true;

  if (SEND_TO_MODS) {
    sendToMods(channel, avatar, nickname, questionText, weekDay, category);
  } else {
    saveQuestion(avatar, nickname, questionText, weekDay, category);
  }
}
