// antiout.js
const { getTime, drive } = global.utils;
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "antiout",
    version: "1.0",
    author: "AceGun x modified by Kylepogi",//this code is recoded by Kyle and fix so don't change author nigga.
    countDown: 0,
    role: 2,
    shortDescription: "Enable or disable antiout",
    longDescription: "",
    category: "box chat",
    guide: "{pn} {{[on | off]}}",
    envConfig: {
      deltaNext: 5
    }
  },
  en: {
    session1: "𝗺𝗼𝗿𝗻𝗶𝗻𝗴",
    session2: "𝗻𝗼𝗼𝗻",
    session3: "𝗮𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻",
    session4: "𝗲𝘃𝗲𝗻𝗶𝗻𝗴"
  },
  onStart: async function({ message, event, threadsData, args }) {
    // Retrieve the current antiout setting or default to true
    let antiout = await threadsData.get(event.threadID, "settings.antiout");
    if (antiout === undefined) {
      antiout = true;
      await threadsData.set(event.threadID, antiout, "settings.antiout");
    }

    // Validate argument
    if (!["on", "off"].includes(args[0])) {
      return message.reply("Please use 'on' or 'off' as an argument.");
    }

    // Update antiout setting
    antiout = args[0] === "on";
    await threadsData.set(event.threadID, antiout, "settings.antiout");
    return message.reply(`Antiout has been ${antiout ? "enabled" : "disabled"}.`);
  },

  onEvent: async function({ api, event, threadsData }) {
    const antiout = await threadsData.get(event.threadID, "settings.antiout");

    // Check if antiout is enabled and if a participant left
    if (antiout && event.logMessageData?.leftParticipantFbId) {
      const userId = event.logMessageData.leftParticipantFbId;
      const threadInfo = await api.getThreadInfo(event.threadID);

      // Check if the user is still in the chat
      if (!threadInfo.participantIDs.includes(userId)) {
        try {
          await api.addUserToGroup(userId, event.threadID);

          // Prepare the welcome message
          const userInfo = await api.getUserInfo(userId);
          const userName = userInfo[userId]?.name || "User";
          const session = getSession();
          const welcomeMessage = `Welcome back ${userName}!`;

          // Send message to notify that the user has been re-added
          await api.sendMessage(
            `✅ 𝗔𝗻𝘁𝗶𝗼𝘂𝘁 𝗺𝗼𝗱𝗲 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n💁🏻‍♂️ ɴᴀᴍᴇ: ${userName}\nɪᴅ: ${userId} has been re-added to the group!\n\nHave a nice ${session}`,
            event.threadID
          );
        } catch (error) {
          await api.sendMessage(
            `⛔ 𝗨𝗻𝗮𝗯𝗹𝗲 𝘁𝗼 𝗿𝗲-𝗮𝗱𝗱 𝘂𝘀𝗲𝗿\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n💁🏻‍♂️ ɴᴀᴍᴇ: ${userName}\nɪᴅ: ${userId} could not be re-added to the group.\n\nHave a nice ${getSession()}`,
            event.threadID
          );
        }
      }
    }
  },

  onLeave: async function({ message, event, threadsData, api, usersData, getLang }) {
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    if (!threadData.settings.sendLeaveMessage) return;

    const { leftParticipantFbId } = event.logMessageData;
    if (leftParticipantFbId === api.getCurrentUserID()) return;

    const now = moment().tz('Asia/Manila');
    const hours = now.hour();
    const threadName = threadData.threadName;
    const userName = await usersData.getName(leftParticipantFbId);

    let leaveMessage = threadData.data.leaveMessage || getLang("defaultLeaveMessage");
    const session = hours <= 10 ? getLang("session1")
                : hours <= 12 ? getLang("session2")
                : hours <= 18 ? getLang("session3")
                : getLang("session4");

    leaveMessage = leaveMessage
      .replace(/\{userName\}|\{userNameTag\}/g, userName)
      .replace(/\{type\}/g, leftParticipantFbId === event.author ? getLang("leaveType1") : getLang("leaveType2"))
      .replace(/\{threadName\}|\{boxName\}/g, threadName)
      .replace(/\{time\}/g, now.format('HH:mm'))
      .replace(/\{session\}/g, session);

    const form = {
      body: leaveMessage,
      mentions: leaveMessage.includes("{userNameTag}") ? [{
        id: leftParticipantFbId,
        tag: userName
      }] : null
    };

    if (threadData.data.leaveAttachment) {
      const files = threadData.data.leaveAttachment;
      const attachments = await Promise.all(files.map(file => drive.getFile(file, "stream")));
      form.attachment = attachments;
    }

    await message.send(form);
  }
};

// Helper function to get the session based on the current hour
function getSession() {
  const now = moment().tz('Asia/Manila');
  const hours = now.hour();
  if (hours <= 10) return "𝗺𝗼𝗿𝗻𝗶𝗻𝗴";
  if (hours <= 12) return "𝗻𝗼𝗼𝗻";
  if (hours <= 18) return "𝗮𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻";
  return "𝗲𝘃𝗲𝗻𝗶𝗻𝗴";
}
