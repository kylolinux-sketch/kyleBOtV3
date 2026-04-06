const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const baseUrl = "https://raw.githubusercontent.com/Saim12678/Saim69/1a8068d7d28396dbecff28f422cb8bc9bf62d85f/font";

module.exports = {
  config: {
    name: "pair",
    aliases: ["lovepair", "match"],
    author: "Christus",
    version: "1.0",
    role: 0,
    category: "love",
    shortDescription: {
      fr: "💘 Génère un couple amoureux entre vous et un autre membre du groupe"
    },
    longDescription: {
      fr: "Cette commande calcule une compatibilité amoureuse entre vous et un membre approprié du groupe actuel en fonction du genre. Affiche les avatars circulaires, le fond et le pourcentage d'amour."
    },
    guide: {
      fr: "{p}{n} — Utilisez cette commande dans un groupe pour trouver une compatibilité amoureuse"
    }
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const senderData = await usersData.get(event.senderID);
      let senderName = senderData.name;

      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      const myData = users.find(user => user.id === event.senderID);
      if (!myData || !myData.gender) {
        return api.sendMessage("⚠️ Impossible de déterminer votre genre.", event.threadID, event.messageID);
      }

      const myGender = myData.gender.toUpperCase();
      let matchCandidates = [];

      if (myGender === "MALE") {
        matchCandidates = users.filter(user => user.gender === "FEMALE" && user.id !== event.senderID);
      } else if (myGender === "FEMALE") {
        matchCandidates = users.filter(user => user.gender === "MALE" && user.id !== event.senderID);
      } else {
        return api.sendMessage("⚠️ Votre genre est indéfini. Impossible de trouver une correspondance.", event.threadID, event.messageID);
      }

      if (matchCandidates.length === 0) {
        return api.sendMessage("❌ Aucun partenaire approprié trouvé dans le groupe.", event.threadID, event.messageID);
      }

      const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      let matchName = selectedMatch.name;

      let fontMap;
      try {
        const { data } = await axios.get(`${baseUrl}/21.json`);
        fontMap = data;
      } catch (e) {
        console.error("Erreur de chargement de la police :", e.message);
        fontMap = {};
      }

      const convertFont = (text) =>
        text.split("").map(ch => fontMap[ch] || ch).join("");

      senderName = convertFont(senderName);
      matchName = convertFont(matchName);

      const width = 800;
      const height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const background = await loadImage("https://files.catbox.moe/29jl5s.jpg");
      ctx.drawImage(background, 0, 0, width, height);

      const sIdImage = await loadImage(
        `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );
      const pairPersonImage = await loadImage(
        `https://graph.facebook.com/${selectedMatch.id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );

      function drawCircle(ctx, img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      drawCircle(ctx, sIdImage, 385, 40, 170);
      drawCircle(ctx, pairPersonImage, width - 213, 190, 170);

      const outputPath = path.join(__dirname, "pair_output.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        const lovePercent = Math.floor(Math.random() * 31) + 70;

        const message = `💞 MATCH AMOUREUX COMPLÉTÉ 💞

🎀  ${senderName} ✨️
🎀  ${matchName} ✨️

🕊️ Le destin a écrit vos noms ensemble 🌹 Que votre lien dure pour toujours ✨️

💘 Compatibilité : ${lovePercent}% 💘`;

        api.sendMessage(
          {
            body: message,
            attachment: fs.createReadStream(outputPath),
          },
          event.threadID,
          () => fs.unlinkSync(outputPath),
          event.messageID
        );
      });

    } catch (error) {
      api.sendMessage(
        "❌ Une erreur est survenue lors de la recherche d'une correspondance.\n" + error.message,
        event.threadID,
        event.messageID
      );
    }
  },
};
