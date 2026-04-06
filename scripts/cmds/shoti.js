const axios = require("axios");

const shoti = {};

module.exports = {
  config: {
    name: "shoti",
    aliases: ["eabab"],
    version: "1.0",
    author: "Kylepogi",
    countDown: 5,
    role: 0,
    shortDescription: "Random Shoti",
    longDescription: "Generating a random Shoti",
    category: "Shoti",
    guide: {
      en: "{pn} on/off"
    }
  },
  onStart: async function ({ api, event }) {
    try {
      const msg = await api.sendMessage(`Sending Shoti, please wait...`, event.threadID);
      const response = await axios.get('https://betadash-shoti-yazky.vercel.app/shotizxx?apikey=shipazu');
      const title = response.data.title;
      const username = response.data.username;
      const nickname = response.data.nickname;
      const shotiUrl = response.data.shotiurl;

      const shotiResponse = await axios.get(shotiUrl, { responseType: "stream" });

      await api.unsendMessage(msg.messageID);

      await api.sendMessage({
        body: `😍 𝗥𝗔𝗡𝗗𝗢𝗠 𝗦𝗛𝗢𝗧𝗜:\n ▬▬▬▬▬▬ ◆ ▬▬▬▬▬▬\n❏title: ${title}\n❀ Username: ${username}\n❀ nick: ${nickname}\n⌥ link: ${shotiUrl}`,
        attachment: shotiResponse.data
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      await api.sendMessage(`𝙴𝚁𝚁𝙾𝚁: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
