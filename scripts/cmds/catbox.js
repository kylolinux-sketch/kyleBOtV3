const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const mime = require("mime-types");

module.exports = {
  config: {
    name: "catbox",
    aliases: ["cb"],
    version: "1.0",
    author: "Christus",
    role: 0,
    category: "utilitaire",
    description: "⬆️ Téléverse un média sur Catbox et retourne le lien.",
    guide: { fr: "Réponds à une image/vidéo/fichier pour l’envoyer sur Catbox.moe" },
  },

  onStart: async function ({ api, event }) {
    const attachment = event.messageReply?.attachments?.[0];
    const attachmentUrl = attachment?.url;

    if (!attachmentUrl) {
      return api.sendMessage("❌ Merci de répondre à un fichier média pour le téléverser.", event.threadID, event.messageID);
    }

    const ext = path.extname(attachmentUrl.split("?")[0]) || ".bin";
    const filename = "upload" + ext;

    api.setMessageReaction("🕒", event.messageID, async () => {
      try {
        const fileRes = await axios.get(attachmentUrl, { responseType: "stream" });

        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", fileRes.data, {
          filename: filename,
          contentType: mime.lookup(ext) || "application/octet-stream",
        });

        const { data } = await axios.post("https://catbox.moe/user/api.php", form, {
          headers: form.getHeaders(),
        });

        api.setMessageReaction("✅", event.messageID, () => {}, true);
        api.sendMessage(`✅ Téléversement réussi ! Voici ton lien :\n${data}`, event.threadID, event.messageID);
      } catch (err) {
        console.error("Erreur de téléversement :", err.message);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        api.sendMessage("❌ Échec du téléversement. Le fichier n’est peut-être pas supporté.", event.threadID, event.messageID);
      }
    }, true);
  }
};
