const axios = require("axios");

module.exports = {
  config: {
    name: "bmdp",
    aliases: ["boysmatchingdp"],
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "Images aléatoires de garçons assortis",
    longDescription: "Envoie des images aléatoires de garçons assortis",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const res = await axios.get("https://xsaim8x-xxx-api.onrender.com/api/bmdp");
      const { boy, boy2 } = res.data;

      api.sendMessage(
        {
          body: "Voici vos images de garçons assortis ! 🥰✨️",
          attachment: await Promise.all([
            global.utils.getStreamFromURL(boy),
            global.utils.getStreamFromURL(boy2)
          ])
        },
        event.threadID,
        event.messageID
      );
    } catch (e) {
      api.sendMessage("❌ Impossible de récupérer les images.", event.threadID, event.messageID);
      console.error(e);
    }
  }
};
