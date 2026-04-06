const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "dog",
    author: "Christus",
    category: "image",
    version: "1.0",
    role: 0,
    shortDescription: { fr: "🐶 Envoie une image aléatoire de chien" },
    longDescription: { fr: "Récupère et envoie une image de chien aléatoire." },
    guide: { fr: "{p}{n} — Affiche une image aléatoire de chien" }
  },

  onStart: async function({ api, event }) {
    try {
      const apiUrl = "https://xsaim8x-xxx-api.onrender.com/api/dog"; // API chien

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      const tempPath = path.join(__dirname, "dog_temp.jpg");
      fs.writeFileSync(tempPath, buffer);

      await api.sendMessage(
        {
          body: "🐶 Voici un chien aléatoire pour toi !",
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
      api.sendMessage("❌ Impossible de récupérer l'image du chien.\n" + err.message, event.threadID, event.messageID);
    }
  }
};
