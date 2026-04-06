module.exports = {
    config: {
        name: "imgbb",
        aliases: [],
        version: "1.0",
        author: "Christus",
        category: "utilitaire",
        countDown: 5,
        role: 0,
        shortDescription: "Téléverse une image/gif/png et obtient son URL",
        longDescription: "Répondre à une image/gif/png la téléversera sur Imgbb et renverra une URL."
    },

    onStart: async function ({ api, event }) {
        try {
            if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
                return api.sendMessage("❌ Veuillez répondre à une image, un gif ou un png pour la téléverser.", event.threadID, event.messageID);
            }

            const attachment = event.messageReply.attachments[0];
            const mediaUrl = attachment.url;

            const axios = require("axios");
            const res = await axios.get(`https://xsaim8x-xxx-api.onrender.com/api/imgbb?url=${encodeURIComponent(mediaUrl)}`);
            const data = res.data;

            if (!data.status) 
                return api.sendMessage("❌ Échec du téléversement de l'image. Veuillez réessayer plus tard.", event.threadID, event.messageID);

            return api.sendMessage(`${data.image.display_url}`, event.threadID, event.messageID);

        } catch (err) {
            console.error(err);
            return api.sendMessage("❌ Une erreur est survenue. Veuillez réessayer plus tard.", event.threadID, event.messageID);
        }
    }
};
