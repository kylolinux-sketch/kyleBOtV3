const axios = require("axios");

async function toFont(text, id = 3) {
  try {
    const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
    const rawRes = await axios.get(GITHUB_RAW);
    const apiBase = rawRes.data.apiv1;

    const apiUrl = `${apiBase}/api/font?id=${id}&text=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);
    return data.output || text;
  } catch (e) {
    console.error("Erreur API Font :", e.message);
    return text;
  }
}

module.exports = {
  config: {
    name: "narutoquiz",
    aliases: ["naruquiz", "nqz", "narutoqz"],
    version: "1.0",
    author: "Christus",
    countDown: 10,
    role: 0,
    category: "jeu",
    guide: { en: "{pn} — Quiz de devinette de personnage Naruto" }
  },

  onStart: async function ({ api, event }) {
    try {
      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const quizApiBase = rawRes.data.apiv1;

      const { data } = await axios.get(`${quizApiBase}/api/narutoqz`);
      const { image, options, answer } = data;

      const imageStream = await axios({ method: "GET", url: image, responseType: "stream" });

      const body = await toFont(`🥷 𝐍𝐚𝐫𝐮𝐭𝐨 𝐐𝐮𝐢𝐳 🍃
━━━━━━━━━━━━━━
📷 Devinez le personnage de Naruto !

🅐 ${options.A}
🅑 ${options.B}
🅒 ${options.C}
🅓 ${options.D}

⏳ Vous avez 1 minute 30 secondes !
💡 Vous avez 3 chances ! Répondez avec A, B, C ou D.`);

      api.sendMessage(
        { body, attachment: imageStream.data },
        event.threadID,
        async (err, info) => {
          if (err) return console.error(err);

          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            correctAnswer: answer,
            chances: 3,
            answered: false
          });

          setTimeout(async () => {
            const quizData = global.GoatBot.onReply.get(info.messageID);
            if (quizData && !quizData.answered) {
              try {
                await api.unsendMessage(info.messageID);
                global.GoatBot.onReply.delete(info.messageID);
              } catch (e) {
                console.error("Échec de la suppression du message du quiz :", e.message);
              }
            }
          }, 90000);
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      const failMsg = await toFont("❌ Échec de la récupération des données du quiz Naruto.");
      api.sendMessage(failMsg, event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    let { author, correctAnswer, messageID, chances } = Reply;
    const reply = event.body?.trim().toUpperCase();

    if (event.senderID !== author) {
      const msg = await toFont("⚠️ Ce n'est pas votre quiz !");
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    if (!reply || !["A", "B", "C", "D"].includes(reply)) {
      const msg = await toFont("❌ Veuillez répondre avec A, B, C ou D.");
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    if (reply === correctAnswer) {
      try {
        await api.unsendMessage(messageID);
      } catch (e) {
        console.error("Échec de la suppression du message du quiz :", e.message);
      }

      const rewardCoin = 400;
      const rewardExp = 150;
      const userData = await usersData.get(event.senderID);
      userData.money += rewardCoin;
      userData.exp += rewardExp;
      await usersData.set(event.senderID, userData);

      const correctMsg = await toFont(`🍥 Dattebayo ! 🎉

✅ Vous avez répondu correctement !
💰 +${rewardCoin} Coins
🌟 +${rewardExp} EXP

🔥 Vous connaissez vraiment l'univers de Naruto !`);

      if (global.GoatBot.onReply.has(messageID)) {
        global.GoatBot.onReply.get(messageID).answered = true;
        global.GoatBot.onReply.delete(messageID);
      }

      return api.sendMessage(correctMsg, event.threadID, event.messageID);
    } else {
      chances--;

      if (chances > 0) {
        global.GoatBot.onReply.set(messageID, { ...Reply, chances });
        const wrongTryMsg = await toFont(`❌ Mauvaise réponse !
⏳ Il vous reste ${chances} chance(s). Réessayez !`);
        return api.sendMessage(wrongTryMsg, event.threadID, event.messageID);
      } else {
        try {
          await api.unsendMessage(messageID);
        } catch (e) {
          console.error("Échec de la suppression du message du quiz :", e.message);
        }
        const wrongMsg = await toFont(`🥺 Plus de chances !
✅ La bonne réponse était : ${correctAnswer}`);
        return api.sendMessage(wrongMsg, event.threadID, event.messageID);
      }
    }
  }
};
