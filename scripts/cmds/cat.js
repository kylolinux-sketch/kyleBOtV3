const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "cat",
    author: "Kyle",
    category: "image",
    version: "1.0",
    role: 0,
    shortDescription: { en: "🐱 Sends a random cat image" },
    longDescription: { en: "Fetches a random cat image from the API." },
    guide: { en: "{p}{n} — Displays a random cat image" }
  },

  onStart: async function({ api, event }) {
    try {
      const apiUrl = "https://xsaim8x-xxx-api.onrender.com/api/cat"; // Cat API

      // Fetch the image from the API
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      // Temporarily save the image
      const tempPath = path.join(__dirname, "cat_temp.jpg");
      fs.writeFileSync(tempPath, buffer);

      // Send the image to the chat
      await api.sendMessage(
        {
          body: "🐱 Here is a random cat just for you!",
          attachment: fs.createReadStream(tempPath)
        },
        event.threadID,
        () => {
          // Delete the temporary file after sending
          fs.unlinkSync(tempPath);
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage(
        `❌ Unable to fetch the cat image.\nError: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
