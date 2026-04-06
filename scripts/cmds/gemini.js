const g = require("fca-aryan-nix");
const a = require("axios");

const u_pro = "http://65.109.80.126:20409/aryan/gemini-pro";
const u_text = "http://65.109.80.126:20409/aryan/gemini";

module.exports = {
  config: {
    name: "gemini",
    aliases: ["gemi"],
    version: "0.0.2",
    author: "Kyle", // modified by Christus
    countDown: 3,
    role: 0,
    shortDescription: "💬 Ask your question to Gemini AI (Text or Image)",
    longDescription: "🧠 Chat with Gemini AI. Reply to an image to ask a question about it.",
    category: "AI",
    guide: "/gemini [your question] (Reply to an image to use Vision)"
  },

  onStart: async function({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt)
      return api.sendMessage(
        "❌ Please provide a question or text to send to Gemini.",
        event.threadID,
        event.messageID
      );

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    let imageUrl = null;
    let apiUrl;

    // Check if replying to an image
    if (event.messageReply && event.messageReply.attachments.length > 0) {
      const attachment = event.messageReply.attachments[0];
      if (['photo', 'sticker', 'animated_image'].includes(attachment.type)) {
        imageUrl = attachment.url;
      }
    } else if (event.attachments.length > 0) {
      const attachment = event.attachments[0];
      if (['photo', 'sticker', 'animated_image'].includes(attachment.type)) {
        imageUrl = attachment.url;
      }
    }

    try {
      // Choose API depending on text or image
      apiUrl = imageUrl
        ? `${u_pro}?prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}`
        : `${u_text}?prompt=${encodeURIComponent(prompt)}`;

      const res = await a.get(apiUrl);
      const reply = res.data?.response;
      if (!reply) throw new Error("No response from the Gemini API.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage(
        `♊ 𝗚𝗲𝗺𝗶𝗻𝗶 𝗔𝗜:\n\n${reply}`,
        event.threadID,
        (err, i) => {
          if (!i) return;
          if (!imageUrl) {
            global.GoatBot.onReply.set(i.messageID, {
              commandName: this.config.name,
              author: event.senderID
            });
          }
        },
        event.messageID
      );

    } catch (e) {
      console.error("Gemini command error:", e.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage(
        "⚠ Oops! Gemini couldn't respond, please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },

  onReply: async function({ api, event, Reply }) {
    if ([api.getCurrentUserID()].includes(event.senderID)) return;
    const prompt = event.body;
    if (!prompt) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await a.get(`${u_text}?prompt=${encodeURIComponent(prompt)}`);
      const reply = res.data?.response;
      if (!reply) throw new Error("No response from the Gemini API.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage(
        `💬 Gemini replies:\n\n${reply}`,
        event.threadID,
        (err, i) => {
          if (!i) return;
          global.GoatBot.onReply.set(i.messageID, {
            commandName: this.config.name,
            author: event.senderID
          });
        },
        event.messageID
      );

    } catch (e) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage(
        "⚠ Oops! Unable to get a response from Gemini at the moment.",
        event.threadID,
        event.messageID
      );
    }
  }
};

const w = new g.GoatWrapper(module.exports);
w.applyNoPrefix({ allowPrefix: true });
