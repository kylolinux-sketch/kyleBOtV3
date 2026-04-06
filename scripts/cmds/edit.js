const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "edit",
    version: "1.0",
    author: "Kyle",
    countDown: 5,
    role: 0,
    shortDescription: "Edit an image via the FluxKontext API",
    longDescription: "Edits an uploaded image according to your prompt using the FluxKontext API.",
    category: "ai-image-edit",
    guide: "{p}edit [prompt] (reply to an image)"
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    const repliedImage = event.messageReply?.attachments?.[0];

    if (!repliedImage || repliedImage.type !== "photo") {
      return message.reply(
        "⚠️ Please reply to a photo **and** provide a prompt to modify it.\nExample: /edit Turn it into a cartoon style"
      );
    }

    if (!prompt) {
      return message.reply(
        "⚠️ Please provide a prompt to modify the image.\nExample: /edit Turn it into a cartoon style"
      );
    }

    const processingMsg = await message.reply("⏳ Processing your image...");

    const imgPath = path.join(__dirname, "cache", `${Date.now()}_edit.jpg`);

    try {
      const imgURL = repliedImage.url;
      const apiURL = `https://dev.oculux.xyz/api/fluxkontext?prompt=${encodeURIComponent(prompt)}&ref=${encodeURIComponent(imgURL)}`;
      
      const res = await axios.get(apiURL, { responseType: "arraybuffer" });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

      await api.unsendMessage(processingMsg.messageID);
      message.reply({
        body: `✅ Image edited according to: "${prompt}"`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.error("EDIT Error:", err);
      await api.unsendMessage(processingMsg.messageID);
      message.reply("❌ Unable to modify the image. Please try again later.");
    } finally {
      if (fs.existsSync(imgPath)) {
        await fs.remove(imgPath);
      }
    }
  }
};
