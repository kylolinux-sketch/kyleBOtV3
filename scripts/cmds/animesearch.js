const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "animesearch",
    aliases: ["anisar", "anisearch", "animeedit"],
    version: "1.0",
    author: "Kyle",
    description: "Searches for an edited anime video",
    category: "anime",
    role: 0,
    usage: "/animesearch sakura haruka",
  },

  onStart: async function({ api, event, args }) {
    const query = args.join(" ");
    if (!query)
      return api.sendMessage("🔍 | Please provide the name of an anime!", event.threadID, event.messageID);

    api.setMessageReaction("⌛️", event.messageID, () => {}, true);

    try {
      const res = await axios.get(`https://xsaim8x-xxx-api.onrender.com/api/animesearch?query=${encodeURIComponent(query)}`);

      if (!res.data?.status || !res.data.random?.noWatermark) {
        api.setMessageReaction("❌️", event.messageID, () => {}, true);
        return api.sendMessage(`❌ | No results found for "${query}"`, event.threadID, event.messageID);
      }

      const videoUrl = res.data.random.noWatermark;
      const filePath = path.join(__dirname, "cache", `${Date.now()}.mp4`);
      const writer = fs.createWriteStream(filePath);

      const response = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "stream",
      });

      response.data.pipe(writer);

      writer.on("finish", async () => {
        api.setMessageReaction("✅️", event.messageID, () => {}, true);

        await api.sendMessage({
          body: `🎥 | Here is a random video of the anime "${query}"`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });

      writer.on("error", err => {
        console.error(err);
        api.setMessageReaction("❌️", event.messageID, () => {}, true);
        api.sendMessage("❌ | Failed to send the video!", event.threadID, event.messageID);
      });
    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌️", event.messageID, () => {}, true);
      api.sendMessage("⚠️ | An error occurred, please try again later.", event.threadID, event.messageID);
    }
  }
};
