const { GoatWrapper } = require('fca-liane-utils');
const axios = require('axios');

module.exports = {
  config: {
    name: "kickall",
    version: "1.0",
    author: "JRT/kira",
    countDown: 5,
    role: 1,
    shortDescription: "kick all members from the group",
    longDescription: "",
    category: "group",
    usages: "[kickall]",
  },
  onStart: async function({ api, event, getText, args }) {
    const { participantIDs } = await api.getThreadInfo(event.threadID);
    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    const botID = api.getCurrentUserID();
    const listUserID = participantIDs.filter(ID => ID != botID);
    return api.getThreadInfo(event.threadID, (err, info) => {
      if (err) return api.sendMessage("An error occurred!", event.threadID);
      if (!info.adminIDs.some(item => item.id == api.getCurrentUserID()))
        return api.sendMessage(`Need group admin rights\nPlease add and try again!`, event.threadID, event.messageID);
      if (info.adminIDs.some(item => item.id == event.senderID)) {
        setTimeout(function() { api.removeUserFromGroup(botID, event.threadID) }, 300000);
        return api.sendMessage(`byebye mga nigga, removed ko kayong lahat cause of permission by my owner/admin command. HAHAHAHAHA`, event.threadID, async (error, info) => {
          for (let id in listUserID) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            api.removeUserFromGroup(listUserID[id], event.threadID);
          }
        });
      } else return api.sendMessage('Only group admins can use this command!', event.threadID, event.messageID);
    });
  }
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
