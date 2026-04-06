const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "leave",
    version: "1.4",
    author: "Kyle",
    category: "events"
  },

  onStart: async function ({ api, event }) {
    // Correct event for member leaving
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID, logMessageData } = event;
    const leftUser = logMessageData.leftParticipantFbId;
    const botID = api.getCurrentUserID();

    if (leftUser === botID) return;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const groupName = threadInfo.threadName;
      const memberCount = threadInfo.participantIDs.length;

      // Fetch user info
      const userInfo = await api.getUserInfo(leftUser);
      const fullName = userInfo[leftUser]?.name || "Member";

      // Manila time
      const timeStr = new Date().toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        weekday: "long", year: "numeric", month: "2-digit", day: "2-digit",
        hour12: true,
      });

      // Image API (you can change this API if needed)
      const apiUrl = `https://xsaim8x-xxx-api.onrender.com/api/welcome?name=${encodeURIComponent(fullName)}&uid=${leftUser}&threadname=${encodeURIComponent(groupName)}&members=${memberCount}`;

      const tmp = path.join(__dirname, "..", "cache");
      await fs.ensureDir(tmp);
      const imagePath = path.join(tmp, `leave_${leftUser}.png`);

      // Download image
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imagePath, response.data);

      // Send leave message
      await api.sendMessage({
        body:
          `👋 𝗚𝗼𝗼𝗱𝗯𝘆𝗲 ${fullName}\n` +
          `𝗟𝗲𝗳𝘁 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽: ${groupName}\n` +
          `📍 𝗠𝗲𝗺𝗯𝗲𝗿𝘀 𝗿𝗲𝗺𝗮𝗶𝗻𝗶𝗻𝗴: ${memberCount}\n` +
          `━━━━━━━━━━━━━━━━\n` +
          `📅 ${timeStr}`,
        attachment: fs.createReadStream(imagePath),
        mentions: [{ tag: fullName, id: leftUser }]
      }, threadID);

      fs.unlinkSync(imagePath);

    } catch (err) {
      console.error("❌ Error sending leave message:", err);
    }
  }
};
