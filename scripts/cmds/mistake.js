const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "mistake",
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "Générateur de mème drôle 'erreur'",
    longDescription: "Taguez ou répondez à quelqu'un pour créer un mème 'erreur'.",
    category: "fun",
    guide: {
      fr: "{pn} @mention ou répondre à quelqu'un",
    },
  },

  onStart: async function ({ event, message, api }) {
    let targetID = Object.keys(event.mentions)[0];
    if (event.type === "message_reply" && !targetID) {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) {
      return message.reply("❌ Veuillez taguer ou répondre à quelqu'un pour créer un mème 'erreur' !");
    }

    const API_URL = `https://xsaim8x-xxx-api.onrender.com/api/mistake?uid=${targetID}`;
    const tmp = path.join(__dirname, "..", "cache");
    await fs.ensureDir(tmp);
    const outputPath = path.join(tmp, `mistake_${targetID}_${Date.now()}.png`);

    try {
      const response = await axios.get(API_URL, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(response.data);
      await fs.writeFile(outputPath, imageBuffer);

      const userInfo = await api.getUserInfo(targetID);
      const tagName = userInfo[targetID]?.name || "Quelqu'un";

      await message.reply({
        body: `@${tagName}`,
        mentions: [{ tag: `@${tagName}`, id: targetID }],
        attachment: fs.createReadStream(outputPath),
      });

      await fs.unlink(outputPath);
    } catch (err) {
      console.error("❌ Erreur de la commande Mistake :", err);
      message.reply("⚠️ Une erreur est survenue. Veuillez réessayer plus tard.");
    }
  },
};
