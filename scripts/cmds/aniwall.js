const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports = {
  config: {
    name: "animewallpaper",
    aliases: ["aniwall"],
    version: "1.0",
    author: "Christus",
    role: 0,
    countDown: 5,
    longDescription: {
      fr: "Récupère des fonds d'écran d'anime et renvoie le nombre spécifié d'images.",
    },
    category: "image",
    guide: {
      fr: "{pn} <titre> - <nombre>\nExemple : {pn} Naruto - 10",
    },
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (!args[0]) {
        return api.sendMessage(
          `❌ Veuillez fournir un titre d'anime.\nExemple : /aniwall Naruto - 10`,
          event.threadID,
          event.messageID
        );
      }

      let input = args.join(" ");
      let count = 5;
      if (input.includes("-")) {
        const parts = input.split("-");
        input = parts[0].trim();
        count = parseInt(parts[1].trim()) || 5;
      }
      if (count > 50) count = 50;

      const apiUrl = `https://xsaim8x-xxx-api.onrender.com/api/anime?title=${encodeURIComponent(input)}`;
      const res = await axios.get(apiUrl);
      const data = res.data?.wallpapers || [];

      if (data.length === 0) {
        return api.sendMessage(
          `❌ Aucun fond d'écran trouvé pour "${input}".`,
          event.threadID,
          event.messageID
        );
      }

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const attachments = [];
      for (let i = 0; i < Math.min(count, data.length); i++) {
        try {
          const imgRes = await axios.get(data[i], { responseType: "arraybuffer" });
          const imgPath = path.join(cacheDir, `${i + 1}.jpg`);
          await fs.promises.writeFile(imgPath, imgRes.data);
          attachments.push(fs.createReadStream(imgPath));
        } catch (e) {
          console.warn(`⚠️ Impossible de récupérer l'image ${i + 1} :`, e.message);
        }
      }

      const bodyMsg = `✅ Voici vos fonds d'écran d'anime pour "${input}"\n🖼 Nombre total d'images : ${attachments.length}`;
      await api.sendMessage(
        { body: bodyMsg, attachment: attachments },
        event.threadID,
        event.messageID
      );

      if (fs.existsSync(cacheDir)) {
        await fs.promises.rm(cacheDir, { recursive: true, force: true });
      }
    } catch (err) {
      console.error("❌ Erreur de la commande AnimeWallpaper :", err);
      return api.sendMessage(
        `⚠️ Erreur : ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
