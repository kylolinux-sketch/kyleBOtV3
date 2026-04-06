module.exports = {
  config: {
      name: "cashout",
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
  if (event.body && event.body.toLowerCase() == "cashout") return message.reply("✅ Your money has been delivered, just wait after 2089years!!");
}
};
