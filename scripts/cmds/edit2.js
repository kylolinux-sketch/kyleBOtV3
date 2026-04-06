const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "edit2",
        aliases: [],
        version: "1.1",
        author: "Kyle",
        countDown: 0,
        role: 0,
        shortDescription: "Modify or generate an image with Gemini-Edit",
        category: "ai-image-edit",
        guide: {
            fr: "{pn} <text> (replying to an image optional)",
        },
    },
    onStart: async function ({ message, event, args, api }) {
        const prompt = args.join(" ");
        if (!prompt) return message.reply("⚠️ Please provide text to generate or modify the image.");

        const apiurl = "https://gemini-edit-omega.vercel.app/edit";
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        try {
            let params = { prompt };
            if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0]) {
                params.imgurl = event.messageReply.attachments[0].url;
            }

            const res = await axios.get(apiurl, { params });

            if (!res.data || !res.data.images || !res.data.images[0]) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply("❌ Unable to obtain the image.");
            }

            const base64Image = res.data.images[0].replace(/^data:image\/\w+;base64,/, "");
            const imageBuffer = Buffer.from(base64Image, "base64");

            const cacheDir = path.join(__dirname, "cache");
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

            const imagePath = path.join(cacheDir, `${Date.now()}.png`);
            fs.writeFileSync(imagePath, imageBuffer);

            api.setMessageReaction("✅", event.messageID, () => {}, true);

            await message.reply(
                { attachment: fs.createReadStream(imagePath) },
                event.threadID,
                () => {
                    fs.unlinkSync(imagePath);
                    message.unsend(message.messageID);
                },
                event.messageID
            );

        } catch (error) {
            console.error("❌ API ERROR:", error.response?.data || error.message);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            return message.reply("❌ An error occurred while generating/modifying the image.");
        }
    }
};
