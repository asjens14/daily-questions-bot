function generateSymbols() {
  const symbols = ["🍒", "🍋", "🍊", "🍉", "⭐", "7️⃣"];
  let result;

  // Keep rolling until the 3 symbols are not all the same.
  do {
    result = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * symbols.length);
      result.push(symbols[randomIndex]);
    }
  } while (result.every((symbol) => symbol === result[0]));

  return result;
}

function generateLossText() {
  const lossPhrases = [
  "Aw, dang it.",
  "Better luck next time!",
  "Oof. That's rough, buddy.",
  "So close! (Not really.)",
  "The house always wins.",
  "You can stop any time. Seriously. Any time.",
  "Have you considered a new hobby?",
  "That's not gambling, that's donating.",
  "Your wallet called. It's crying.",
  "Skill issue.",
  "Cool. Cool cool cool.",
  "Well. That happened.",
  "Congrats on the loss!",
  "Try again. Or don't. I'm a bot, not a cop.",
  "Statistically, you should've won by now. Statistically.",
  "One more spin won't hurt.",
  "It's not a problem until you admit it is.",
  "Double or nothing? (Please don't.)",
  "The next one's a winner. Trust me.",
  "Just one more. You've got this.",
  "RIP.",
  "Yikes.",
  "F.",
  "Ouch.",
  "L + ratio.",
  ];
  return lossPhrases[Math.floor(Math.random() * lossPhrases.length)];
}

export default function generateDisplay() {
  const symbols = generateSymbols();
  const resultText = generateLossText();

  const slotDisplay =
    '╔═══════════════╗\n' +
    `║ ${symbols[0]} ║ ${symbols[1]} ║ ${symbols[2]} ║\n` +
    '╚═══════════════╝';

  return {
    slotDisplay,
    resultText
  };
}