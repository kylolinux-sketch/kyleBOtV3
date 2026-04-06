const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const ownerInfo = {
  name: "KYLE BAIT-IT",
  facebook: "https://www.facebook.com/kyletheintrovert",
  telegram: "kylenogram",
  supportGroup: ""
};

module.exports = {
  config: {
    name: "pending",
    aliases: ["pend"], 
    version: "2.0",
    author: "kyle",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Approve or reject pending conversations"
    },
    longDescription: {
      en: "Reply with the conversation numbers to approve, or reply with c[number(s)] / cancel[number(s)] to reject."
    },
    category: "admin"
  },

  langs: {
    en: {
      invaildNumber: "%1 is not a valid number",
      cancelSuccess: "Rejected %1 conversation(s)!",
      approveSuccess: "Successfully approved %1 conversation(s)!",
      cantGetPendingList: "Unable to get the list of pending conversations!",
      returnListPending:
        "»「PENDING」«❮ Total pending conversations: %1 ❯\n\n%2\n\n💡 Guide:\n- Approve: reply with the numbers (ex: 1 2 3)\n- Reject: reply with c[number(s)] or cancel[number(s)] (ex: c 1 2 or cancel 3 4)",
      returnListClean: "「PENDING」There are no pending conversations"
    }
  },

  onReply: async function ({ api, event, Reply, getLang }) {
    if (String(event.senderID) !== String(Reply.author)) return;
    const { body, threadID, messageID } = event;
    let count = 0;
    const BOT_UID = api.getCurrentUserID();
    const API_ENDPOINT = "https://xsaim8x-xxx-api.onrender.com/api/botconnect";

    const lowerBody = body.trim().toLowerCase();

    // REJECT conversations
    if (lowerBody.startsWith("c") || lowerBody.startsWith("cancel")) {

      const trimmed = body.replace(/^(c|cancel)\s*/i, "").trim();
      const index = trimmed.split(/\s+/).filter(Boolean);

      if (index.length === 0)
        return api.sendMessage(
          "Please provide at least one conversation number to reject.",
          threadID,
          messageID
        );

      for (const i of index) {
        if (isNaN(i) || i <= 0 || i > Reply.pending.length) {
          api.sendMessage(getLang("invaildNumber", i), threadID);
          continue;
        }

        const targetThreadID = Reply.pending[parseInt(i) - 1].threadID;
        try {
          await api.removeUserFromGroup(BOT_UID, targetThreadID);
          count++;
        } catch (error) {
          console.error(`⚠️ Unable to remove bot from conversation ${targetThreadID}:`, error.message);
        }
      }

      return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
    }

    // APPROVE conversations
    else {
      const index = body.split(/\s+/).filter(Boolean);
      if (index.length === 0)
        return api.sendMessage(
          "Please provide at least one conversation number to approve.",
          threadID,
          messageID
        );

      for (const i of index) {
        if (isNaN(i) || i <= 0 || i > Reply.pending.length) {
          api.sendMessage(getLang("invaildNumber", i), threadID);
          continue;
        }

        const targetThread = Reply.pending[parseInt(i) - 1].threadID;
        const prefix = global.utils.getPrefix(targetThread);
        const nickNameBot = global.GoatBot.config.nickNameBot || "Sakura Bot";

        try {
          await api.changeNickname(nickNameBot, targetThread, BOT_UID);
        } catch (err) {
          console.warn(`⚠️ Nickname change failed for ${targetThread}:`, err.message);
        }

        try {
          const apiUrl = `${API_ENDPOINT}?botuid=${BOT_UID}&prefix=${encodeURIComponent(prefix)}`;
          const tmpDir = path.join(__dirname, "..", "cache");
          await fs.ensureDir(tmpDir);
          const imagePath = path.join(tmpDir, `botconnect_image_${targetThread}.png`);

          const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
          fs.writeFileSync(imagePath, response.data);

          const textMsg = [
            "✅ 𝖦𝗋𝗈𝗎𝗉 𝖲𝗎𝖼𝖼𝖾𝗌𝗌𝖿𝗎𝗅𝗅𝗒 𝖢𝗈𝗇𝗇𝖾𝖼𝗍𝖾𝖽 🎊",
            `𝗕𝗼𝘁 𝗣𝗿𝗲𝗳𝗶𝘅: ${prefix}`,
            `𝗧𝘆𝗽𝗲: ${prefix}help 𝗍𝗈 𝗌𝖾𝖾 𝖺𝗅𝗅 𝖼𝗈𝗆𝗆𝖺𝗇𝖽𝗌`,
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            `👑 𝖮𝗐𝗇𝖾𝗋: ${ownerInfo.name}`,
            `🌐 𝖥𝖺𝖼𝖾𝖻𝗈𝗈𝗄: ${ownerInfo.facebook}`,
            `✈️ 𝖳𝖾𝗅𝖾𝗀𝗋𝖺𝗆: ${ownerInfo.telegram}`,
            `🤖 Support GC: ${ownerInfo.supportGroup}`
          ].join("\n");

          await api.sendMessage(
            {
              body: textMsg,
              attachment: fs.createReadStream(imagePath)
            },
            targetThread
          );

          fs.unlinkSync(imagePath);
        } catch (err) {
          console.error(`⚠️ Error sending bot connect message to ${targetThread}:`, err);

          const fallbackMsg = [
            "❌ Failed to generate image. Here is the information:",
            "✅ Group Successfully Connected 🎊",
            `🔹 Prefix: ${prefix}`,
            `🔸 Type: ${prefix}help for commands`,
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            `👑 Owner: ${ownerInfo.name}`,
            `🌐 Facebook: ${ownerInfo.facebook}`,
            `✈️ Telegram: ${ownerInfo.telegram}`,
            `🤖 Support GC: ${ownerInfo.supportGroup}`
          ].join("\n");

          api.sendMessage(fallbackMsg, targetThread);
        }

        count++;
      }

      return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
    }
  },

  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID } = event;
    let msg = "", index = 1;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pending].filter(g => g.isSubscribed && g.isGroup);

      for (const item of list)
        msg += `${index++}/ ${item.name} (${item.threadID})\n`;

      if (list.length !== 0) {
        return api.sendMessage(
          getLang("returnListPending", list.length, msg),
          threadID,
          (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID,
              pending: list
            });
          },
          messageID
        );
      } else {
        return api.sendMessage(getLang("returnListClean"), threadID, messageID);
      }
    } catch (e) {
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }
  }
};
