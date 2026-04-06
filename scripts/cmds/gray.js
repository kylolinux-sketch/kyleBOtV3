const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
    config: {
        name: "gray",
        version: "1.0",
        author: "Christus",
        countDown: 5,
        role: 0,
        category: "image",
        description: "Convertit l'image répondue ou l'URL en niveaux de gris",
        guide: "{pn} [RéponseImg/lienImg]"
    },

    onStart: async function ({ api, args, message, event }) {
        try {
            let imageUrl;

            if (event.type === "message_reply") {
                const attachment = event.messageReply.attachments?.[0];
                if (!attachment) return message.reply("❌ | Veuillez répondre à une image.");
                if (!attachment.url || attachment.type !== "photo") {
                    return message.reply("❌ | Seules les réponses d'images sont autorisées. Les vidéos ou autres fichiers ne sont pas supportés.");
                }
                imageUrl = attachment.url;
            } else if (args[0]?.startsWith("http")) {
                imageUrl = args[0];
            } else {
                return message.reply("❌ | Veuillez répondre à une image ou fournir un lien d'image.");
            }

            api.setMessageReaction("🖤", event.messageID, () => {}, true);
            const waitMsg = await message.reply("Conversion en niveaux de gris... <🖤");

            const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
            const rawRes = await axios.get(GITHUB_RAW);
            const apiBase = rawRes.data.apiv1;

            const apiUrl = `${apiBase}/api/gray?url=${encodeURIComponent(imageUrl)}`;
            const response = await axios({
                url: apiUrl,
                method: "GET",
                responseType: "arraybuffer"
            });

            const filePath = path.join(__dirname, "cache", `gray_${Date.now()}.png`);
            await fs.outputFile(filePath, response.data);

            message.unsend(waitMsg.messageID);
            api.setMessageReaction("✅", event.messageID, () => {}, true);
            message.reply({
                body: "Voici votre image en niveaux de gris 🖤",
                attachment: fs.createReadStream(filePath)
            });

        } catch (error) {
            console.error(error);
            message.reply("❌ | Impossible de convertir l'image en niveaux de gris. Veuillez réessayer plus tard.");
        }
    }
};
