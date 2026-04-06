const a = require("axios");

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports = {
  config: {
    name: "prompt",
    aliases: ["p", "explain"],
    version: "0.0.1",
    author: "Kyle",
    category: "ai",
    guide: {
      en: "{pn} reply with an image",
    },
  },

  onStart: async function ({ api: b, args: c, event: d }) {
    let baseApi;
    try {
      const configRes = await a.get(nix);
      baseApi = configRes.data && configRes.data.api;
      if (!baseApi) throw new Error("Configuration Error: Missing API in GitHub JSON.");
    } catch (error) {
      return b.sendMessage("❌ Failed to fetch API configuration from GitHub.", d.threadID, d.messageID);
    }

    const u = `${baseApi}/prompt`;
    const p = c.join(" ") || "Describe this image";

    if (d.type === "message_reply" && d.messageReply.attachments[0]?.type === "photo") {
      try {
        const i = d.messageReply.attachments[0].url;
        
        const r = await a.get(u, {
          params: { imageUrl: i, prompt: p }
        });

        const x = r.data.response || "No response";
        
        if (r.data.status === false) {
          return b.sendMessage(`❌ API Error: ${r.data.message}`, d.threadID, d.messageID);
        }

        b.sendMessage(x, d.threadID, d.messageID);
        return b.setMessageReaction("✅", d.messageID, () => {}, true);

      } catch (e) {
        console.error("Local API call error:", e.message || e);
        b.sendMessage("❌ An error occurred with the API. Please try again later.", d.threadID, d.messageID);
        return b.setMessageReaction("❌", d.messageID, () => {}, true);
      }
    }

    b.sendMessage("⚠️ Please reply with an image.", d.threadID, d.messageID);
  }
};
