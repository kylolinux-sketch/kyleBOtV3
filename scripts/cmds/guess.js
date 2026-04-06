const guessOptions = ["🐣", "🙂", "🍀", "🌸", "🌼", "🐟", "🍎", "🍪", "🦄", "🍀"];
const fs = require("fs");

module.exports = {
  config: {
    name: "guess",
    version: "1.4",
    author: "Christus",
    countDown: 5,
    role: 0,
    category: "jeu",
    shortDescription: {
      fr: "Devine l'emoji !"
    },
    guide: {
      fr: "{pn} [montant] - Jouer au jeu de devinette\n{pn} top - Voir le classement"
    }
  },

  onStart: async function ({ args, event, message, usersData }) {
    const senderID = event.senderID;

    if (args[0] === "top") {
      const allUsers = await usersData.getAll();
      const filtered = allUsers
        .filter(u => u.data?.guessWin)
        .sort((a, b) => (b.data.guessWin || 0) - (a.data.guessWin || 0))
        .slice(0, 20);

      if (filtered.length === 0)
        return message.reply("🚫 Aucun gagnant pour le moment !");

      const topList = filtered.map((u, i) =>
        `${i + 1}. ${u.name} - 🏆 ${u.data.guessWin || 0} victoires`
      ).join("\n");

      return message.reply(`🏆 TOP 20 DES GAGNANTS DU JEU 🏆\n\n${topList}`);
    }

    const user = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0)
      return message.reply("⚠️ Veuillez entrer un montant positif valide.");

    if (user.money < amount)
      return message.reply("💸 Vous n'avez pas assez d'argent pour jouer.");

    const options = [];
    for (let i = 0; i < 3; i++) {
      const emoji = guessOptions[Math.floor(Math.random() * guessOptions.length)];
      options.push(emoji);
    }

    const correctIndex = Math.floor(Math.random() * 3);
    const correctEmoji = options[correctIndex];

    const msg = await message.reply(
      `🎯 DEVINE L'EMOJI !\n\n` +
      `1️⃣ ${options[0]}    2️⃣ ${options[1]}    3️⃣ ${options[2]}\n\n` +
      `Réponds avec 1, 2 ou 3 pour deviner.`
    );

    const timeout = setTimeout(() => {
      message.reply("⌛ Temps écoulé ! Vous n'avez pas deviné à temps.");
      global.GoatBot.onReply.delete(msg.messageID);
    }, 30 * 1000);

    global.GoatBot.onReply.set(msg.messageID, {
      commandName: this.config.name,
      author: senderID,
      correct: correctIndex + 1,
      bet: amount,
      emoji: correctEmoji,
      messageID: msg.messageID,
      timeout
    });
  },

  onReply: async function ({ event, message, Reply, usersData }) {
    const senderID = event.senderID;

    if (!["1", "2", "3"].includes(event.body.trim()))
      return message.reply("⚠️ Veuillez répondre uniquement avec 1, 2 ou 3.");

    if (senderID !== Reply.author)
      return message.reply("❌ Ce n'est pas votre partie !");

    clearTimeout(Reply.timeout);
    global.GoatBot.onReply.delete(Reply.messageID);

    const user = await usersData.get(senderID);
    const guess = parseInt(event.body.trim());

    let resultMessage = "";

    if (guess === Reply.correct) {
      const newMoney = user.money + Reply.bet * 4;
      const wins = (user.data?.guessWin || 0) + 1;
      await usersData.set(senderID, {
        money: newMoney,
        "data.guessWin": wins
      });

      resultMessage =
        `✅ Correct ! L'emoji était ${Reply.emoji}\n\n` +
        `💰 Vous avez gagné : ${Reply.bet * 4} pièces\n` +
        `💵 Votre nouveau solde : ${newMoney} pièces\n\n` +
        `🎉 Félicitations !`;
    } else {
      const newMoney = user.money - Reply.bet;
      await usersData.set(senderID, { money: newMoney });

      resultMessage =
        `❌ Faux ! La bonne réponse était ${Reply.correct} → ${Reply.emoji}\n\n` +
        `💸 Vous avez perdu : ${Reply.bet} pièces\n` +
        `💵 Votre nouveau solde : ${newMoney} pièces\n\n` +
        `😢 Bonne chance la prochaine fois !`;
    }

    return message.reply(resultMessage);
  }
};
