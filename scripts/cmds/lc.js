module.exports = {
  config: {
      name: "lastchat",
     aliases: [],
      version: "1.0",
      author: "Kyle",
      countDown: 5,
      role: 0,
      shortDescription: "sarcasm",
      longDescription: "sarcasm",
      category: "reply",
  },
onStart: async function(){}, 
onChat: async function({
  event,
  message,
  getLang
}) {
  if (event.body && event.body.toLowerCase() == "lc") return message.reply("sagip ko na lastchat.\n\n       ✞︎ 𝐑.𝐈.𝐏 ✞︎\n\n      ---------------\n  𝐂𝐀𝐔𝐒𝐄 𝐎𝐅 𝐃𝐄𝐀𝐓𝐇:\n      LAST CHAT\n 🕊️𝑖𝑛 𝑙𝑜𝑣𝑖𝑛𝑔 𝑚𝑒𝑚𝑜𝑟𝑖𝑒𝑠🕊️\n");
}
};
