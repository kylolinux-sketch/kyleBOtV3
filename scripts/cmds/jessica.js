const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
    config: {
        name: "jessica",
        version: "1.17",
        aliases: ["Jessica", "soho"],
        author: "Kylepogi",
        countDown: 5,
        role: 0,
        shortDescription: {
            vi: "Xem cách dùng lệnh",
            en: "Generate Jessica Soho line text"
        },
        longDescription: {
            vi: "Tạo văn bản theo phong cách Jessica Soho",
            en: "Generate text in the style of Jessica Soho"
        }
    },

    onStart: async function({ api, event, args }) {
        const pathImg = __dirname + '/cache/lexi.png';
        const text = args.join(" ");

        if (!text) {
            return api.sendMessage("Provide a text first.", event.threadID, event.messageID);
        }

        try {
            const response = await axios.get(
                `https://api-canvass.vercel.app/jessica?text=${encodeURIComponent(text)}`, 
                { responseType: 'arraybuffer' }
            );

            await fs.writeFile(pathImg, response.data);

            return api.sendMessage(
                { attachment: fs.createReadStream(pathImg) }, 
                event.threadID, 
                () => fs.unlinkSync(pathImg), 
                event.messageID
            );
        } catch (error) {
            return api.sendMessage("API request failed.", event.threadID, event.messageID);
        }
    }
};
