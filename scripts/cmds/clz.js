const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_URL = "http://65.109.80.126:20409/aryan/colorize";

module.exports = {
  config: {
    name: "colorize",
    aliases: ["clz"],
    version: "1.1",
    role: 0,
    author: "Christus",
    countDown: 10,
    longDescription: "Colorise les images en noir et blanc.",
    category: "image",
    guide: {
      fr: "{pn} — Répond à une image en noir et blanc pour la coloriser."
    }
  },

  onStart: async function ({ message, event }) {
    if (
      !event.messageReply ||
      !event.messageReply.attachments ||
      !event.messageReply.attachments[0] ||
      event.messageReply.attachments[0].type !== "photo"
    ) {
      return message.reply("🎨 Veuillez répondre à une image en noir et blanc pour la coloriser.");
    }

    const imageUrl = event.messageReply.attachments[0].url;
    const tempPath = path.join(__dirname, "cache", `colorized_${Date.now()}.jpg`);
    let waitMessageID;

    try {
      const waitMsg = await message.reply("🔄 Colorisation en cours... Patientez un instant !");
      waitMessageID = waitMsg.messageID;

      // Appel à l'API de colorisation
      const response = await axios.get(`${API_URL}?imageUrl=${encodeURIComponent(imageUrl)}`);
      const colorizedImageUrl = response.data.result;

      if (!colorizedImageUrl) {
        throw new Error(response.data.error || "L'API n'a pas renvoyé d'URL d'image.");
      }

      // Téléchargement de l'image colorisée
      const imgStream = await axios.get(colorizedImageUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(tempPath);
      imgStream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Envoi de l'image colorisée
      await message.reply({
        body: "✅ Voici votre image colorisée ! 🎨",
        attachment: fs.createReadStream(tempPath),
      });

    } catch (e) {
      console.error("Erreur Colorize :", e);
      let errorMessage = "❌ Une erreur est survenue lors de la colorisation. Réessayez plus tard.";

      if (e.response?.data?.error) {
        errorMessage = `❌ Erreur API Colorize : ${e.response.data.error}`;
        if (e.response.data.details) {
          let details = e.response.data.details;
          if (typeof details === 'object' && details !== null) {
            details = details.message || JSON.stringify(details);
          }
          errorMessage += `\nDétails : ${details}`;
        }
      } else if (e.message) {
        errorMessage = `❌ Erreur de traitement : ${e.message}`;
      }

      message.reply(errorMessage);

    } finally {
      if (waitMessageID) message.unsend(waitMessageID);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }
};
