const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");

module.exports.config = {
  name: "imagedetail",
  aliases: ["imgdetail"],
  version: "1.0",
  author: "Christus",
  countDown: 5,
  role: 0,
  description: "Afficher les métadonnées détaillées d'une image",
  category: "image",
  guide: "{pn} répondre à une image"
};

module.exports.onStart = async ({ api, event }) => {
  try {
    const attachment = event.messageReply?.attachments?.[0];
    if (!attachment || attachment.type !== "photo") {
      return api.sendMessage(
        "📸 Veuillez répondre à une photo pour obtenir ses détails !",
        event.threadID,
        event.messageID
      );
    }

    const imgUrl = attachment.url;

    const imgBuffer = await axios
      .get(imgUrl, { responseType: "arraybuffer" })
      .then(res => res.data);

    const tempPath = path.join(__dirname, `temp_${Date.now()}.jpg`);
    await fs.writeFile(tempPath, imgBuffer);

    const metadata = await sharp(imgBuffer).metadata();

    function approximateRatio(width, height) {
      const ratioDecimal = width / height;
      const standardRatios = [
        { ratio: 1, label: "1:1" },
        { ratio: 4 / 3, label: "4:3" },
        { ratio: 3 / 2, label: "3:2" },
        { ratio: 16 / 9, label: "16:9" },
        { ratio: 9 / 16, label: "9:16" },
        { ratio: 21 / 9, label: "21:9" },
        { ratio: 3 / 4, label: "3:4" },
        { ratio: 2 / 3, label: "2:3" },
      ];
      let closest = standardRatios[0];
      let minDiff = Math.abs(ratioDecimal - closest.ratio);
      for (const r of standardRatios) {
        const diff = Math.abs(ratioDecimal - r.ratio);
        if (diff < minDiff) {
          minDiff = diff;
          closest = r;
        }
      }
      return closest.label;
    }

    let ratio = "N/A";
    let orientationType = "N/A";

    if (metadata.width && metadata.height) {
      ratio = approximateRatio(metadata.width, metadata.height);
      if (metadata.width > metadata.height) orientationType = "Paysage";
      else if (metadata.width < metadata.height) orientationType = "Portrait";
      else orientationType = "Carré";
    }

    const caption =
      `✨ DÉTAILS DE L'IMAGE ✨\n\n` +
      `⦿ Format : ${metadata.format || "Inconnu"}\n` +
      `⦿ Largeur : ${metadata.width || 0}px\n` +
      `⦿ Hauteur : ${metadata.height || 0}px\n` +
      `⦿ Ratio : ${ratio} (${orientationType})\n` +
      `⦿ Taille du fichier : ${(imgBuffer.byteLength / 1024).toFixed(2)} KB (${(imgBuffer.byteLength / (1024 * 1024)).toFixed(2)} MB)\n` +
      `⦿ Profondeur des bits : ${metadata.depth || "N/A"}\n` +
      `⦿ Canaux : ${metadata.channels || "N/A"}\n` +
      `⦿ Espace colorimétrique : ${metadata.space || "N/A"}\n` +
      `⦿ Alpha : ${metadata.hasAlpha ? "Oui" : "Non"}\n` +
      `⦿ Compression : ${metadata.compression || "N/A"}\n` +
      `⦿ Orientation : ${metadata.orientation || "N/A"}\n` +
      `⦿ Progressif : ${metadata.isProgressive ? "Oui" : "Non"}\n\n` +
      `🧠 Commande créée par Christus 💙`;

    await api.sendMessage(
      {
        body: caption,
        attachment: fs.createReadStream(tempPath)
      },
      event.threadID,
      async () => await fs.remove(tempPath),
      event.messageID
    );

  } catch (err) {
    console.error(err);
    return api.sendMessage(
      "⚠️ Oups ! Une erreur est survenue.\n💬 Veuillez réessayer plus tard !",
      event.threadID,
      event.messageID
    );
  }
};
