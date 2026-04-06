const { getStreamsFromAttachment } = global.utils;
const g = require("fca-aryan-nix");
const axios = require('axios'); 
const request = require('request'); 
const fs = require("fs"); 

// Temporary storage for notifications and replies
const notificationMemory = {};
const adminReplies = {};

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "7.0",
    author: "NTKhang x Kyle x Gemini",
    countDown: 5,
    role: 2,
    category: "owner",
    shortDescription: "📢 Sends a stylish notification and allows admins to reply via the bot",
    longDescription: "Sends a styled message to all groups with the group name and notifies admins of replies so they can respond via the bot.",
    guide: { en: "notification <message>" },
    usePrefix: false,
    noPrefix: true
  },

  // Main command: send the notification
  onStart: async function({ message, api, event, threadsData, usersData, envCommands, commandName, args }) {
    const { delayPerGroup = 300 } = envCommands[commandName] || {};
    if (!args[0]) return message.reply("⚠ Please enter the message to send to all groups.");

    const allThreads = (await threadsData.getAll())
      .filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);

    if (!allThreads.length) return message.reply("⚠ No groups found.");

    message.reply(`⏳ Starting to send to ${allThreads.length} groups...`);

    let sendSuccess = 0;
    const sendError = [];
    
    // Feature: Get Sender Name and Mentions
    const senderName = await usersData.getName(event.senderID);
const now = new Date();
				// Convert to Philippines Time (UTC+8)
				const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
				// Format time in PH style
				const timeString = phTime.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
				const dateString = phTime.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });
    const mentions = [{ tag: senderName, id: event.senderID }];

    for (const thread of allThreads) {
      let groupName = thread.name || "Unknown group";
      let totalMembers = 0, maleCount = 0, femaleCount = 0;

      try {
        const info = await api.getThreadInfo(thread.threadID);
        groupName = info.threadName || groupName;
        
        // Feature: Total Members, Male, and Female
        totalMembers = info.participantIDs.length;
        info.userInfo.forEach(user => {
          if (user.gender === "MALE") maleCount++;
          else if (user.gender === "FEMALE") femaleCount++;
        });
      } catch (e) {
        // Fallback to thread data if api call fails
        totalMembers = thread.members.length;
      }

      const notificationBody = `🔔 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗧𝗢 ${groupName}
━━━━━━━━━━━━━━━━━━━
👤𝖠𝖽𝗆𝗂𝗇/𝖮𝗐𝗇𝖾𝗋:
• ${senderName}
━━━━━━━━━━━━━━━━━━━
╭┈ ❒ 📬 | 𝗠𝗘𝗦𝗦𝗔𝗚𝗘:
╰┈➤ ${args.join(" ")}



👥 𝗧𝗢𝗧𝗔𝗟 𝗠𝗘𝗠𝗕𝗘𝗥𝗦: ${totalMembers}
🚹 𝗠𝗔𝗟𝗘: ${maleCount} | 🚺 𝗙𝗘𝗠𝗔𝗟𝗘: ${femaleCount}
⏰ 𝗧𝗶𝗺𝗲 𝗻𝗼𝘄: ${timeString}
📆 𝗗𝗮𝘁𝗲 𝗻𝗼𝘄: ${dateString}
━━━━━━━━━━━━━━━━━━━
ℹ️ | This is an announcement from the 𝗔𝗗𝗠𝗜𝗡𝗕𝗢𝗧.`.trim();

      const formSend = {
        body: notificationBody,
        mentions,
        attachment: await getStreamsFromAttachment([
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ])
      };

      try {
        const sentMsg = await api.sendMessage(formSend, thread.threadID);
        sendSuccess++;
        notificationMemory[`${thread.threadID}_${sentMsg.messageID}`] = { groupName };
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      } catch (err) {
        sendError.push({ threadID: thread.threadID, groupName, error: err.message });
      }
    }

    // Summary
    let summary = `
━━━━━━━━━━━━
📬 𝐒𝐄𝐍𝐃𝐈𝐍𝐆 𝐒𝐔𝐌𝐌𝐀𝐑𝐘
✅ Successful groups: ${sendSuccess}
❌ Failed groups: ${sendError.length}
`;
    if (sendError.length)
      sendError.forEach(err => {
        summary += `❌ ${err.groupName} : ${err.error}\n`;
      });
    summary += `━━━━━━━━━━━━`;
    message.reply(summary.trim());
  },

  onMessage: async function({ api, event, usersData }) {
    if (!event.messageReply) return;

    const repliedMsgID = event.messageReply.messageID;
    const notificationKey = Object.keys(notificationMemory).find(key =>
      key.endsWith(`_${repliedMsgID}`)
    );
    if (!notificationKey) return;

    const { groupName } = notificationMemory[notificationKey];
    const userName = await usersData.getName(event.senderID);
    const userID = event.senderID;

    const adminMessage = `
━━━━━━━━━━━━
👤 𝐑𝐄𝐏𝐋𝐘 𝐓𝐎 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝗔𝗧𝐈𝗢𝗡
📝 Name : ${userName}
🆔 ID : ${userID}
🏷️ Group : ${groupName}
──────────────────────────
💬 Message :
${event.body}
💡 Reply to this message to respond.
━━━━━━━━━━━━
`.trim();

    const allThreads = await api.getThreadList(100, null, ["INBOX"]);
    const adminIDs = allThreads
      .filter(t => t.isGroup)
      .flatMap(t => t.members.filter(m => m.role === 2).map(m => m.userID));
    const uniqueAdmins = [...new Set(adminIDs)];

    for (const adminID of uniqueAdmins) {
      try {
        const sent = await api.sendMessage(adminMessage, adminID);
        adminReplies[sent.messageID] = { originalThreadID: event.threadID, userID };
      } catch {}
    }
  },

  onReply: async function({ api, event }) {
    const replyData = adminReplies[event.messageReply?.messageID];
    if (!replyData) return;

    const { originalThreadID, userID } = replyData;
    try {
      await api.sendMessage(event.body, originalThreadID || userID);
      delete adminReplies[event.messageReply.messageID];
    } catch {}
  },

  onVoice: async function({ api, event }) {
    if (!event.isGroup) return;
    if (event.type === "message" && event.body === "" && event.attachments.length > 0) {
      const attachment = event.attachments[0];
      if (attachment.type === "audio") {
        const voiceMessage = await api.getAttachment(attachment);
        const allThreads = await api.getThreadList(100, null, ["INBOX"]);
        const adminIDs = allThreads
          .filter(t => t.isGroup)
          .flatMap(t => t.members.filter(m => m.role === 2).map(m => m.userID));
        const uniqueAdmins = [...new Set(adminIDs)];

        for (const adminID of uniqueAdmins) {
          try {
            await api.sendMessage({
              body: `📝 Voice message from ${event.senderName}`,
              attachment: voiceMessage
            }, adminID);
          } catch {}
        }
      }
    }
  }
};
