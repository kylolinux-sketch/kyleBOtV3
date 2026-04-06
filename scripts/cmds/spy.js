const axios = require("axios");

const baseApiUrl = "https://www.noobs-api.rf.gd/dipto";

module.exports = {
  config: {
    name: "spy",
    aliases: ["hackerspy","stalk","pfp","profile","pfinfo"],
    version: "1.2",
    role: 0,
    author: "Kyle",
    description: "Get information and the profile picture of a user",
    category: "information",
    countDown: 10,
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    try {
      const uid1 = event.senderID;
      const uid2 =
        event.mentions && Object.keys(event.mentions).length
          ? Object.keys(event.mentions)[0]
          : null;

      let uid;
      if (args && args[0]) {
        if (/^\d+$/.test(args[0])) {
          uid = args[0];
        } else {
          const match = args[0].match(/profile\.php\?id=(\d+)/);
          if (match) uid = match[1];
        }
      }

      if (!uid) {
        uid =
          event.type === "message_reply"
            ? event.messageReply?.senderID
            : uid2 || uid1;
      }

      let babyTeach = 0;
      try {
        const response = await axios.get(`${baseApiUrl}/baby?list=all`);
        const dataa = response?.data || {};
        babyTeach =
          dataa?.teacher?.teacherList?.find((t) => t?.[uid])?.[uid] || 0;
      } catch (e) {
        babyTeach = 0;
      }

      const userInfo = (await api.getUserInfo(uid)) || {};
      const info = userInfo[uid] || {};

      let avatarUrl = null;
      try {
        avatarUrl = (await usersData.getAvatarUrl(uid)) || null;
      } catch (e) {
        avatarUrl = null;
      }
      if (!avatarUrl) avatarUrl = "https://i.imgur.com/TPHk4Qu.png";

      let genderText = "⚧️ Unknown";
      switch (info.gender) {
        case 1:
          genderText = "👩 Female";
          break;
        case 2:
          genderText = "👨 Male";
          break;
      }

      const userRecord = (await usersData.get(uid)) || {};
      const money = Number(userRecord.money || 0);
      const exp = Number(userRecord.exp || 0);
      const allUser = (await usersData.getAll()) || [];

      const rank =
        allUser.length > 0
          ? allUser
              .slice()
              .sort((a, b) => (b.exp || 0) - (a.exp || 0))
              .findIndex((u) => String(u.userID) === String(uid)) + 1
          : 0;
      const moneyRank =
        allUser.length > 0
          ? allUser
              .slice()
              .sort((a, b) => (b.money || 0) - (a.money || 0))
              .findIndex((u) => String(u.userID) === String(uid)) + 1
          : 0;

      const accountType = info.type ? String(info.type).toUpperCase() : "User";
      const isFriend = info.isFriend ? "✅ Yes" : "❌ No";
      const isBirthday =
        typeof info.isBirthday !== "undefined" && info.isBirthday !== false
          ? info.isBirthday
          : "Private";

      let threadInfo = {};
      try {
        if (event.isGroup && event.threadID) {
          threadInfo = (await api.getThreadInfo(event.threadID)) || {};
        }
      } catch (e) {
        threadInfo = {};
      }

      const now = new Date();
      const localeOpts = {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      const reportDate = new Intl.DateTimeFormat("en-GB", localeOpts).format(now);

      const userInformation = [
        "𝐒𝐏𝐘 & 𝐒𝐓𝐀𝐋𝐊 𝐂𝐌𝐃:",
        "━━━━━━━━━━━━",
        "",
        "👤 𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍",
        `📝 𝗙𝘂𝗹𝗹 𝗻𝗮𝗺𝗲: ${info?.name || userRecord?.name || "Unknown"}`,
        `👤 𝗙𝗶𝗿𝘀𝘁 𝗻𝗮𝗺𝗲: ${extractFirstName(info?.name || userRecord?.name)}`,
        `👥 𝗟𝗮𝘀𝘁 𝗻𝗮𝗺𝗲: ${extractLastName(info?.name || userRecord?.name)}`,
        `🆔 𝗨𝘀𝗲𝗿 𝗜𝗗: ${uid}`,
        `⚧️ 𝗚𝗲𝗻𝗱𝗲𝗿: ${genderText}`,
        `🔗 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${info?.vanity || "Not set"}`,
        `🎂 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆: ${isBirthday}`,
        `🌐 𝗣𝗿𝗼𝗳𝗶𝗹𝗲 𝗨𝗥𝗟: ${info?.profileUrl || "Not available"}`,
        "",
        "📱 𝐀𝐂𝐂𝐎𝐔𝐍𝐓 𝐒𝐓𝐀𝐓𝐔𝐒",
        `🏷️ 𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝘁𝘆𝗽𝗲: ${accountType}`,
        `✅ 𝗩𝗲𝗿𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻: ${info?.is_verified ? "✅ Verified" : "❌ Not verified"}`,
        `👥 𝗙𝗿𝗶𝗲𝗻𝗱: ${isFriend}`,
        `🚫 𝗕𝗮𝗻𝗻𝗲𝗱: ${info?.is_suspended ? "✅ Yes" : "❌ No"}`,
        "",
        "🤖 𝐁𝐎𝐓 𝐃𝐀𝐓𝐀𝐁𝐀𝐒𝐄",
        `📅 𝗙𝗶𝗿𝘀𝘁 𝗷𝗼𝗶𝗻: ${userRecord?.firstJoin || "Unknown"}`,
        `🔄 𝗟𝗮𝘀𝘁 𝘂𝗽𝗱𝗮𝘁𝗲: ${userRecord?.lastUpdate || reportDate}`,
        `💰 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: ${formatMoney(money)}`,
        `⭐ 𝗘𝘅𝗽𝗲𝗿𝗶𝗲𝗻𝗰𝗲: ${exp || 0} XP`,
        `🎯 𝗟𝗲𝘃𝗲𝗹: ${userRecord?.level || "N/A"}`,
        `📈 𝗡𝗲𝘅𝘁 𝗹𝗲𝘃𝗲𝗹: ${userRecord?.nextLevelXP || "N/A"}`,
        "",
        "💬 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍",
        `🏷️ 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲: ${threadInfo?.nicknames?.[uid] || "Not set"}`,
        `📅 𝗝𝗼𝗶𝗻𝗲𝗱 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽: ${threadInfo?.participantIDs && threadInfo.participantIDs.includes(uid) ? "Yes" : "Unknown"}`,
        `👑 𝗔𝗱𝗺𝗶𝗻 𝘀𝘁𝗮𝘁𝘂𝘀: ${threadInfo?.adminIDs && threadInfo.adminIDs.includes(uid) ? "✅ Admin" : "❌ Member"}`,
        `💬 𝗠𝗲𝘀𝘀𝗮𝗴𝗲𝘀 𝘀𝗲𝗻𝘁: ${userRecord?.messages || 0}`,
        `📍 𝗚𝗿𝗼𝘂𝗽 𝗻𝗮𝗺𝗲: ${threadInfo?.threadName || "Unknown"}`,
        "",
        "📊 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐒",
        `🌟 𝗣𝗿𝗼𝗳𝗶𝗹𝗲 𝘀𝗰𝗼𝗿𝗲: ${userRecord?.profileScore || "N/A"}`,
        `🏆 𝗨𝘀𝗲𝗿 𝗿𝗮𝗻𝗸: ${rank > 0 ? `#${rank}` : "Unranked"}`,
        `📈 𝗘𝗫𝗣 𝗿𝗮𝗻𝗸: ${userRecord?.expRank || "N/A"}`,
        `💰 𝗠𝗼𝗻𝗲𝘆 𝗿𝗮𝗻𝗸: ${moneyRank > 0 ? `#${moneyRank}` : "Unranked"}`,
        `🕐 𝗥𝗲𝗽𝗼𝗿𝘁 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱: ${reportDate}`,
      ].join("\n");

      await message.reply({
        body: userInformation,
        attachment: await global.utils.getStreamFromURL(avatarUrl),
      });
    } catch (err) {
      console.error("SPY command error:", err);
      return message.reply("❌ An error occurred while retrieving the information.");
    }
  },
};

// --- helpers ---
function extractFirstName(full) {
  if (!full) return "Unknown";
  const parts = String(full).trim().split(/\s+/);
  return parts[0] || "Unknown";
}
function extractLastName(full) {
  if (!full) return "";
  const parts = String(full).trim().split(/\s+/);
  return parts.slice(1).join(" ") || "";
}
function formatMoney(num) {
  num = Number(num) || 0;
  const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"];
  let unit = 0;
  while (num >= 1000 && unit < units.length - 1) {
    num /= 1000;
    unit++;
  }
  return (Math.round(num * 10) / 10).toString().replace(/\.0$/, "") + units[unit];
}
