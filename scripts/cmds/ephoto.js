const axios = require("axios");

const availableTEMPLATES = {
  "1": "Multicolor Neon Light",
  "2": "Free Name Galaxy Style",
  "3": "Underwater 3D Text",
  "4": "Viettel Logo",
  "5": "Pavement Typography",
  "6": "Cute Pig 3D Text",
  "7": "Green Neon Light Effect",
  "8": "Futuristic Light Text",
  "9": "Graffiti Cover",
  "10": "Neon Devil Wings Text",
  "11": "Advanced Glow Effects",
  "12": "Dragon Ball Style Text",
  "13": "Blue Metal Text Effect",
  "14": "Modern Gold",
  "15": "Galaxy Tree Effect",
  "16": "Online Gold Letters",
  "17": "Metal Mascot Logo Maker",
  "18": "Plasma Text Effect",
  "19": "Handwritten Fog Text",
  "20": "Modern Gold 3",
  "21": "Online Metal Logo",
  "22": "Graffiti Letters",
  "23": "Galaxy Writing Effect",
  "24": "Graffiti Text 5",
  "25": "Road Paint Text",
  "26": "Chocolate Text",
  "27": "Naruto Shippuden Logo",
  "28": "Layered Typography Art",
  "29": "Write in the Sand",
  "30": "Green Brush Typography",
  "31": "Comic Boom Text",
  "32": "Cracked 3D Text",
  "33": "Paint Splash Text",
  "34": "Digital Glitch Text",
  "35": "Dragon Steel Text",
  "36": "Graffiti Text 3",
  "37": "Zombie 3D Text",
  "38": "Matrix Text Effect",
  "39": "Galaxy Neon Light Text",
  "40": "3D Metal Text",
  "41": "Blackboard Writing",
  "42": "Cake Writing",
  "43": "Wet Glass Text",
  "44": "Galaxy Angel Wings",
  "45": "3D Wood Text",
  "46": "3D Aluminum Balloon",
  "47": "Christmas Snow Text",
  "48": "Luxury Gold Text",
  "49": "Anonymous Hacker Avatar",
  "50": "Broken Glass Text",
  "51": "Blackpink Style Logo",
  "52": "Denim Fabric Text",
  "53": "Rainy Fog Text",
  "54": "Birthday Aluminum Balloon",
  "55": "Starry Night Effect",
  "56": "Paper Cut Effect",
  "57": "Water Text",
  "58": "Unique Green Light Word",
  "59": "3D Beach Text",
  "60": "Blackboard Writing 2",
  "61": "Dragon Fire Text",
  "62": "Underwater Text",
  "63": "Cake Text",
  "64": "Impressive Metal Font",
  "65": "Eraser Wiped Text",
  "66": "Online Metal Text",
  "67": "Dancing Text",
  "68": "Cloud Text in the Sky",
  "69": "3D Water Text",
  "70": "Chrome Text Effect",
  "71": "Bokeh Text Effect",
  "72": "Incandescent Bulb Text",
  "73": "Metal Avatar Name",
  "74": "3D Hologram Text",
  "75": "Online Starry Night",
  "76": "Gold Text Effect",
  "77": "Purple Text Effect",
  "78": "Pixel Glitch Text",
  "79": "Dark Green Typography",
  "80": "Diamond Text",
  "81": "Blue Neon Logo",
  "82": "Neon Text Effect",
  "83": "Shadow Text",
  "84": "Galaxy Light Text",
  "85": "Titanium Text",
  "86": "Fabric Text Effect",
  "87": "Blackpink Logo 2",
  "88": "3D Text Effect",
  "89": "Magic Text Effect",
  "90": "Sand Beach Text",
  "91": "Neon Glitch Text",
  "92": "Fabric Text Effect",
  "93": "Coffee Message Text",
  "94": "Jewelry Text Effect",
  "95": "Hot Metal Effect",
  "96": "Typography Creator 5",
  "97": "Candy Text Effect",
  "98": "Galaxy Bat Writing",
  "99": "Fireworks Effect",
  "100": "Online Graffiti Text"
};

module.exports = {
  config: {
    name: "ephoto",
    version: "1.0",
    author: "Kyle",
    countDown: 5,
    role: 0,
    shortDescription: "Create a stylish Ephoto text effect or view the template list",
    longDescription: "Generate an Ephoto effect using text and an ID (1–100) or display the list of all available templates",
    category: "image",
    guide: {
      en: "{pn} <text> - <id>\nExample: {pn} Kyle - 49\n\nView list:\n{pn} list"
    }
  },

  onStart: async function ({ event, message, args, api }) {
    const prefix =
      global.utils && typeof global.utils.getPrefix === "function"
        ? await global.utils.getPrefix(event.threadID)
        : "/";

    const input = args.join(" ").trim();

    if (input.toLowerCase() === "list") {
      let msg = "🎨 𝐄𝐏𝐇𝐎𝐓𝐎 𝐓𝐄𝐌𝐏𝐋𝐀𝐓𝐄𝐒 (1–100)\n\n";
      for (const i in availableTEMPLATES) {
        msg += `🆔 ${i.padStart(3, " ")} → ${availableTEMPLATES[i]}\n`;
      }
      msg += `\n💡 Usage:\n${prefix}ephoto <text> - <id>\nExample: ${prefix}ephoto Kyle - 49`;
      return message.reply(msg);
    }

    const parts = input.split("-");
    const text = parts[0]?.trim();
    const id = parseInt(parts[1]?.trim());

    if (!text || !id) {
      return message.reply(`⚠️ Usage: ${prefix}ephoto <text> - <id>\nExample: ${prefix}ephoto Kyle - 49`);
    }

    if (isNaN(id) || id < 1 || id > 100) {
      return message.reply(
        `❌ Invalid ID! Please use an ID between 1 and 100.\nUse '${prefix}ephoto list' to see all available templates.`
      );
    }

    const loadingMsg = await message.reply(`🎨 Generating Ephoto effect for “${text}” (ID: ${id})...`);

    try {
      const githubRawUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const apiRes = await axios.get(githubRawUrl);
      const baseUrl = apiRes.data.apiv1;
      const res = await axios.get(`${baseUrl}/api/ephoto?id=${id}&text=${encodeURIComponent(text)}`);

      if (!res.data?.status || !res.data.result_url) {
        await api.unsendMessage(loadingMsg.messageID);
        return message.reply("❌ Oops! An error occurred. Please try again later.");
      }

      await api.unsendMessage(loadingMsg.messageID);
      return message.reply({
        body: `✅ 𝐄𝐩𝐡𝐨𝐭𝐨 effect generated!\n\n🆔 ID: ${id} (${availableTEMPLATES[id]})\n🔤 Text: ${text}`,
        attachment: await global.utils.getStreamFromURL(res.data.result_url)
      });
    } catch (e) {
      await api.unsendMessage(loadingMsg.messageID);
      return message.reply("❌ Oops! An error occurred. Please try again later.");
    }
  }
};
