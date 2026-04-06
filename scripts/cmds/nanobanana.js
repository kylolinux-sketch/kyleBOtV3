const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "nanobanana",
    aliases: ["nb"],
    version: "1.0",
    author: "Christus | API Renz",
    countDown: 5,
    role: 0,
    shortDescription: "Générer une image avec l'API NanoBanana",
    longDescription: "Génère une image IA basée sur votre prompt en utilisant l'API NanoBanana.",
    category: "générateur d'images",
    guide: "{p}nanobanana [prompt]"
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply(
        "⚠️ Veuillez fournir un prompt pour générer une image.\nExemple : /nanobanana Un chat mignon portant des lunettes de soleil"
      );
    }

    const processingMsg = await message.reply("⏳ Génération de votre image en cours...");

    const imgPath = path.join(__dirname, "cache", `${Date.now()}_nanobanana.jpg`);
    const seed = 12345; 

    try {
      const apiURL = `https://dev.oculux.xyz/api/nanobanana?prompt=${encodeURIComponent(prompt)}&seed=${seed}`;
      const res = await axios.get(apiURL, { responseType: "arraybuffer" });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));
      await api.unsendMessage(processingMsg.messageID);
      message.reply({
        body: `✅ Image générée pour : "${prompt}"`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.error("Erreur API NanoBanana :", err);
      await api.unsendMessage(processingMsg.messageID);
      message.reply("❌ Échec de la génération de l'image. Veuillez réessayer plus tard.");
    } finally {
      if (fs.existsSync(imgPath)) {
        await fs.remove(imgPath);
      }
    }
  }
};
