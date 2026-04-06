const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "fluxpro",
    version: "1.0",
    author: "Kyle",
    countDown: 5,
    role: 0,
    description: {
      en: "Generates an AI image using the Oculux Flux 1.1 Pro API",
    },
    category: "image generator",
    guide: {
      en: "{pn} <prompt>\nExample: {prefix}fluxpro cyberpunk samurai in the rain",
    },
  },

  onStart: async function ({ message, event, args, api, commandName }) {
    const prefix =
      global.utils?.getPrefix?.(event.threadID) ||
      global.GoatBot?.config?.prefix ||
      "/";

    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply(
        `⚠️ Please provide a prompt.\nExample: ${prefix}${commandName} futuristic dragon flying in space`
      );
    }

    api.setMessageReaction("🎨", event.messageID, () => {}, true);
    const waitingMsg = await message.reply(
      "🎨 Generating your image... Please wait..."
    );

    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://dev.oculux.xyz/api/flux-1.1-pro?prompt=${encodedPrompt}`;
    const imgPath = path.join(__dirname, "cache", `fluxpro_${event.senderID}.png`);

    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, response.data);

      await message.reply(
        {
          body: `✅ Here is your FluxPro AI image.\n🖋️ Prompt: ${prompt}`,
          attachment: fs.createReadStream(imgPath),
        },
        () => {
          fs.unlinkSync(imgPath);
          if (waitingMsg?.messageID) api.unsendMessage(waitingMsg.messageID);
        }
      );
    } catch (error) {
      console.error("FluxPro generation error:", error);
      message.reply(
        "⚠️ Failed to generate the FluxPro image. Please try again later."
      );
      if (waitingMsg?.messageID) api.unsendMessage(waitingMsg.messageID);
    }
  },
};
