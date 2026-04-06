const axios = require("axios");

module.exports = {
  config: {
    name: "cdp",
    aliases: ["coupledp"],
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "DP de couple aléatoire",
    longDescription: "Envoie un DP de couple aléatoire",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const res = await axios.get("https://xsaim8x-xxx-api.onrender.com/api/cdp2");
      const { boy, girl } = res.data;

      api.sendMessage(
        {
          body: "💑 Voici ton DP de couple ! 😘✨",
          attachment: await Promise.all([
            global.utils.getStreamFromURL(boy),
            global.utils.getStreamFromURL(girl)
          ])
        },
        event.threadID,
        event.messageID
      );
    } catch (e) {
      api.sendMessage("❌ Impossible de récupérer le DP de couple.", event.threadID, event.messageID);
      console.error(e);
    }
  }
};
