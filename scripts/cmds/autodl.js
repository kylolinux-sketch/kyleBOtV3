const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

const supportedDomains = [
  "facebook.com", "fb.watch",
  "youtube.com", "youtu.be",
  "tiktok.com",
  "instagram.com", "instagr.am",
  "likee.com", "likee.video",
  "capcut.com",
  "spotify.com",
  "terabox.com",
  "twitter.com", "x.com",
  "drive.google.com",
  "soundcloud.com",
  "ndown.app",
  "pinterest.com", "pin.it"
];

module.exports = {
  config: {
    name: "autodl",
    version: "3.5",
    author: "Kyle",
    role: 0,
    shortDescription: "Automatic Media Downloader",
    longDescription: "Automatically downloads videos/audio with sender info and PH time.",
    category: "utility",
    guide: { en: "Just send a supported link to download automatically." }
  },

  onStart: async function({ api, event }) {
    api.sendMessage(
      "📥 Auto-downloader is active. Send a link to download it automatically.",
      event.threadID,
      event.messageID
    );
  },

  onChat: async function({ api, event }) {
    const { body, threadID, messageID, senderID } = event;
    if (!body || !body.startsWith("https://")) return;

    const isSupported = supportedDomains.some(domain => body.includes(domain));
    if (!isSupported) return;

    const startTime = Date.now();
    api.setMessageReaction("📥", messageID, () => {}, true);

    try {
      // Fetch sender name for mention
      const userInfo = await api.getUserInfo(senderID);
      const senderName = userInfo[senderID]?.name || "User";

      const API = `https://xsaim8x-xxx-api.onrender.com/api/auto?url=${encodeURIComponent(body)}`;
      const res = await axios.get(API);

      if (!res.data || (!res.data.high_quality && !res.data.low_quality)) {
        throw new Error("Invalid API response.");
      }

      const mediaURL = res.data.high_quality || res.data.low_quality;
      const mediaTitle = res.data.title ? res.data.title.replace(/\n/g, " ") : "No title available";
      const reactions = res.data.reaction || "N/A";
      const views = res.data.views || "N/A";
      
      const phTime = moment.tz("Asia/Manila");
      const dateNow = phTime.format("MMMM DD, YYYY");
      const timeNow = phTime.format("hh:mm:ss A");
      const dayNow = phTime.format("dddd");

      const extension = mediaURL.includes(".mp3") ? "mp3" : "mp4";
      const filePath = path.join(__dirname, "cache", `auto_${Date.now()}.${extension}`);

      await fs.ensureDir(path.join(__dirname, "cache"));

      const response = await axios.get(mediaURL, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(response.data));

      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
      const domain = supportedDomains.find(d => body.includes(d));
      const platformName = domain.split('.')[0].toUpperCase();

      const infoMsg = 
`📥 𝗔𝗨𝗧𝗢 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥
━━━━━━━━━━━━━━━━━━
👤 𝗦𝗲𝗻𝗱𝗲𝗿: ${senderName}
🆔 𝗨𝘀𝗲𝗿 𝗜𝗗: ${senderID}

📝 𝗧𝗶𝘁𝗹𝗲: ${mediaTitle}

🌐 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${platformName}
👍 𝗥𝗲𝗮𝗰𝘁𝗶𝗼𝗻𝘀: ${reactions}
👁️ 𝗩𝗶𝗲𝘄𝘀: ${views}
⏱️ 𝗧𝗶𝗺𝗲: ${timeTaken}s

📅 𝗗𝗮𝘁𝗲: ${dateNow}
⏰ 𝗧𝗶𝗺𝗲: ${timeNow}
🗓️ 𝗗𝗮𝘆: ${dayNow}
━━━━━━━━━━━━━━━━━━
𝑚𝑎𝑑𝑒 𝑤𝑖𝑡ℎ ♥︎ 𝐾𝑦𝑙𝑒 𝐵𝑎𝑖𝑡-𝑖𝑡`;

      api.sendMessage({
          body: infoMsg,
          mentions: [{ tag: senderName, id: senderID }],
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID
      );

      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", messageID, () => {}, true);
    }
  }
};
