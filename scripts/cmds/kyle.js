module.exports = {
  config: {
      name: "kylecalling",
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
  if (event.body && event.body.toLowerCase() == "kyle") return message.reply("don't call  my owner Kyle if he ain't here!!");
}
};
