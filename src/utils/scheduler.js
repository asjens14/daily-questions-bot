import cron from "node-cron";
import { sendDailyQuestion } from "./sendDailyQuestion.js";

// Schedule to run every day at 9:00 AM server time
cron.schedule(
  "8 16 * * *",
  () => {
    sendDailyQuestion();
  },
  { timezone: "US/Mountain" }
);
