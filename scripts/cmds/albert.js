let t = {};

module.exports = {
  config: {
    name: "albert",
    version: "2.6",
    author: "Kyle",
    countDown: 5,
    role: 0,
    hasPermission: 0,
    usePrefix: false,
    aliases: ['albrt', 'einstein'], // fixed the typo here
    shortDescription: "Albert Einstein",
    description: "Albert Einstein canvas",
    usages: "text",
    credits: "Kylepogi",
    cooldowns: 0
  },

  onStart: async function({ api, event, args }) {	
    const fs = require("fs-extra");
    const axios = require("axios");
    const pathImg = __dirname + '/cache/e.png'; // changed to.png
    const text = args.join(" ");

    if (!text) return api.sendMessage("Provide a text first", event.threadID, event.messageID);	

    try {
      const response = await axios.get(`https://api-canvass.vercel.app/albert?text=${encodeURIComponent(text)}`, { responseType: 'arraybuffer' });

      await fs.writeFile(pathImg, response.data);

      return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
    } catch (error) {
      console.error(error); // added this line to log the error
      return api.sendMessage("Error occurred. Please try again later.", event.threadID, event.messageID);
    } 
  }
};
