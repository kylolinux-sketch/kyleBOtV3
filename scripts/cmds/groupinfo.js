const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "groupinfo",
    aliases: ["boxinfo"],
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "Voir toutes les informations sur ce groupe",
    longDescription: "Obtenez tous les détails de votre groupe tels que le nom, l'ID, le nombre de membres, les statistiques de genre et la liste des admins.",
    category: "groupe",
  },

  onStart: async function ({ api, event }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const memCount = threadInfo.participantIDs.length;
      const genderMale = [];
      const genderFemale = [];
      const genderUnknown = [];
      const adminList = [];

      for (const user of threadInfo.userInfo) {
        const gender = user.gender;
        if (gender === "MALE") genderMale.push(user);
        else if (gender === "FEMALE") genderFemale.push(user);
        else genderUnknown.push(user.name);
      }

      for (const admin of threadInfo.adminIDs) {
        const info = await api.getUserInfo(admin.id);
        adminList.push(info[admin.id].name);
      }

      const approvalMode = threadInfo.approvalMode ? "✅ Activé" : "❌ Désactivé";
      const emoji = threadInfo.emoji || "👍";
      const imageURL = threadInfo.imageSrc || null;
      const msg = 
`✨ 𝐈𝐍𝐅𝐎 𝐆𝐑𝐎𝐔𝐏𝐄 ✨
━━━━━━━━━━━━━━━
🏷️ Nom: ${threadInfo.threadName || "Groupe sans nom"}
🆔 ID: ${threadInfo.threadID}
💬 Emoji: ${emoji}
💭 Messages: ${threadInfo.messageCount.toLocaleString()}
👥 Membres: ${memCount}
👨 Hommes: ${genderMale.length}
👩 Femmes: ${genderFemale.length}
❔ Inconnu: ${genderUnknown.length}
🛡️ Nombre d'admins: ${threadInfo.adminIDs.length}
🔒 Mode d'approbation: ${approvalMode}
━━━━━━━━━━━━━━━
👑 Admins:
${adminList.map(name => `• ${name}`).join("\n")}
━━━━━━━━━━━━━━━
🧠 Créé par Christus 💙`;

      const cachePath = path.join(__dirname, "cache", "groupinfo.jpg");
      fs.ensureDirSync(path.join(__dirname, "cache"));

      if (imageURL) {
        const response = await axios.get(imageURL, { responseType: "arraybuffer" });
        fs.writeFileSync(cachePath, Buffer.from(response.data, "binary"));

        await api.sendMessage(
          {
            body: msg,
            attachment: fs.createReadStream(cachePath),
          },
          event.threadID,
          () => fs.unlinkSync(cachePath),
          event.messageID
        );
      } else {
        await api.sendMessage(msg, event.threadID, event.messageID);
      }

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Une erreur est survenue lors de la récupération des informations du groupe.", event.threadID, event.messageID);
    }
  },
};
