const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "girls",
    version: "1.0",
    author: "Aesther",
    role: 2,
    shortDescription: "NSFW: Image de fille sexy",
    longDescription: "Affiche une image NSFW directement depuis une API (sans JSON)",
    category: "nsfw",
    usages: "",
    cooldowns: 5
  },

  onStart: async function ({ api, event }) {
    const imageUrl = "https://delirius-apiofc.vercel.app/nsfw/girls";
    const imgPath = path.join(__dirname, "cache", `girl_${Date.now()}.jpg`);

    try {
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(response.data, "utf-8"));

      api.sendMessage({
        body: "🔞 | Voici une fille pour toi 😏",
        attachment: fs.createReadStream(imgPath)
      }, event.threadID, () => fs.unlinkSync(imgPath)); // Supprime après envoi
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Impossible de récupérer l'image depuis l'API.", event.threadID);
    }
  }
};
