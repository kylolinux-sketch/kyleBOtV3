const axios = require("axios");

module.exports = {
  config: {
    name: "aotvideo",
    aliases: ["aotvid", "attackontitanvid", "attackontitanvideo"],
    version: "1.0",
    author: "Kyle",
    role: 0,
    countDown: 5,
    description: "Sends a random Attack on Titan video.",
    category: "anime",
  },

  onStart: async function ({ api, event }) {
    try {
      // Temporary message while loading
      const processingMessage = await api.sendMessage(
        "⏳ Please wait a few seconds...",
        event.threadID,
        event.messageID
      );

      // Fetch API base URL from GitHub
      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const apiBase = rawRes.data.apiv1;

      // Fetch a random AOT video
      const res = await axios.get(`${apiBase}/api/aotvideo`);

      if (!res.data || !res.data.url) {
        await api.unsendMessage(processingMessage.messageID);
        return api.sendMessage(
          "❌ Oops! An error occurred, please try again later.",
          event.threadID,
          event.messageID
        );
      }

      const videoUrl = res.data.url;

      // Send the video
      const msg = {
        body: "🎬 Here is a random Attack on Titan video for you! 😊💖",
        attachment: await global.utils.getStreamFromURL(videoUrl),
      };
      await api.sendMessage(msg, event.threadID, event.messageID);

      // Delete the temporary message
      await api.unsendMessage(processingMessage.messageID);

    } catch (error) {
      console.error(error);
      await api.sendMessage(
        "❌ Oops! An error occurred, please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};
