const fs = require('fs');

module.exports = {
  config: {
    name: "file",
    version: "1.0",
    author: "kyle",
    countDown: 5,
    role: 2,
    shortDescription: "Send bot script",
    longDescription: "Send bot specified file ",
    category: "owner",
    guide: "{pn} file name. Ex: .{pn} filename"
  },

  onStart: async function ({ message, args, api, event }) {
const permission = ["61565434041712", "61579034603912"];
    if (!permission.includes(event.senderID)) {
      return api.sendMessage("⛔ 𝗔𝗖𝗖𝗘𝗦𝗦 𝗗𝗘𝗡𝗜𝗘𝗗\n\n𝖸𝖮𝖴 𝖣𝖮𝖭'𝖳 𝖧𝖠𝖵𝖤 𝖤𝖭𝖮𝖴𝖦𝖧 𝖯𝖤𝖱𝖬𝖨𝖲𝖲𝖨𝖮𝖭 𝖳𝖮 𝖴𝖲𝖤𝖣 𝖳𝖧𝖨𝖲 𝖢𝖮𝖬𝖬𝖠𝖭𝖣𝖲, 𝖮𝖭𝖫𝖸 𝖬𝖸 𝖮𝖶𝖭𝖤𝖱 𝖢𝖠𝖭 𝖣𝖮 𝖨𝖳(⋋▂⋌)", event.threadID, event.messageID);
    }
    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage("Please provide a file name.", event.threadID, event.messageID);
    }

    const filePath = __dirname + `/${fileName}.js`;
    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`File not found: ${fileName}.js`, event.threadID, event.messageID);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    api.sendMessage({ body: fileContent }, event.threadID);
  }
};
