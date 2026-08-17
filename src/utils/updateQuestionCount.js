import { updateQuestionNumber } from "../database/questions.js";

export async function incrementQuestionNumber(number) {
  updateQuestionNumber(number);
}
