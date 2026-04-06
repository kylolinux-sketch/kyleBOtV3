const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "fox",
    author: "Christus",
    category: "image",
    version: "1.0",
    role: 0,
    shortDescription: { fr: "🦊 Envoie une image aléatoire de renard" },
    longDescription: { fr: "Récupère une image aléatoire de renard." },
    guide: { fr: "{p}{n} — Montre une image aléatoire de renard" }
  },

  onStart: async function({ api, event }) {
    try {
      const apiUrl = "https://xsaim8x-xxx-api.onrender.com/api/fox"; // API Fox

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      const tempPath = path.join(__dirname, "fox_temp.jpg");
      fs.writeFileSync(tempPath, buffer);

      await api.sendMessage(
        {
          body: "🦊 Voici un renard aléatoire pour toi !",
          attachment: fs.createReadStream(tempPath)
        },
        event.threadID,
        () => {
          fs.unlinkSync(tempPath);
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Impossible de récupérer l'image du renard.\n" + err.message, event.threadID, event.messageID);
    }
  }
};
