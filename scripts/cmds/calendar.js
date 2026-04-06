const axios = require("axios");
const fs = require("fs");
const path = require("path");

const cacheDirectory = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "calendar",
    version: "1.0",
    author: "Saimx69x",
    shortDescription: "🗓️ Calendrier stylé en anglais via API",
    longDescription: "Récupère une image de calendrier depuis l'API pour le fuseau horaire Asia/Dhaka",
    category: "utility",
    guide: { fr: "{p}calendar" }
  },

  onStart: async function ({ api, event }) {
    try {
      const response = await axios.get(
        "https://xsaim8x-xxx-api.onrender.com/api/calendar",
        { responseType: "arraybuffer" }
      );

      const imgBuffer = Buffer.from(response.data, "binary");

      await fs.promises.mkdir(cacheDirectory, { recursive: true });
      const filePath = path.join(cacheDirectory, "calendar.png");
      await fs.promises.writeFile(filePath, imgBuffer);

      api.sendMessage(
        { attachment: fs.createReadStream(filePath) },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error("Erreur commande calendrier :", err.message);
      api.sendMessage(
        "❌ Impossible de récupérer l'image du calendrier depuis l'API.",
        event.threadID,
        event.messageID
      );
    }
  }
};
