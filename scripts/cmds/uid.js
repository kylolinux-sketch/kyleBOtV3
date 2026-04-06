const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const { findUid } = global.utils;

// Full-width bold converter
function toFullWidthBold(str) {
  const map = {
    A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',G:'𝐆',
    H:'𝐇',I:'𝐈',J:'𝐉',K:'𝐊',L:'𝐋',M:'𝐌',N:'𝐍',
    O:'𝐎',P:'𝐏',Q:'𝐐',R:'𝐑',S:'𝐒',T:'𝐓',U:'𝐔',
    V:'𝐕',W:'𝐖',X:'𝐗',Y:'𝐘',Z:'𝐙',
    a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',
    h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',m:'𝐦',n:'𝐧',
    o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',u:'𝐮',
    v:'𝐯',w:'𝐰',x:'𝐱',y:'𝐲',z:'𝐳',
    0:'𝟎',1:'𝟏',2:'𝟐',3:'𝟑',4:'𝟒',5:'𝟓',
    6:'𝟔',7:'𝟕',8:'𝟖',9:'𝟗'
  };
  return str.split('').map(c => map[c] || c).join('');
}

async function createNeonBanner(name, uid, avatarUrl) {
  const width = 800, height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Neon gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#0f0c29");
  gradient.addColorStop(0.5, "#302b63");
  gradient.addColorStop(1, "#24243e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Avatar with glow
  const avatar = await loadImage(avatarUrl);
  const size = 180, x = 50, y = 60;

  ctx.save();
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 + 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, x, y, size, size);
  ctx.restore();

  // Text: name + uid in neon style with full-width bold
  ctx.font = "bold 42px Arial";
  ctx.fillStyle = "#00ffff";
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 15;
  ctx.fillText(toFullWidthBold(name), x + size + 40, height / 2 - 10);

  ctx.font = "bold 30px Arial";
  ctx.fillStyle = "#ff00ff";
  ctx.shadowColor = "#ff00ff";
  ctx.shadowBlur = 10;
  ctx.fillText("UID: " + toFullWidthBold(uid), x + size + 40, height / 2 + 40);

  return canvas.toBuffer("image/png");
}

module.exports = {
  config: {
    name: "uid",
	aliases: ["id","ID"], 
    version: "1.8",
    author: "NTKhang + Kyle",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View UID" },
    longDescription: { en: "View UID with neon banner" },
    category: "info",
    guide: { en: "{pn} / @tag / reply / link" }
  },

  onStart: async function ({ message, event, args, api, usersData }) {
    const regExCheckURL = /^(http|https):\/\/[^ "]+$/;
    let uid;

    if (event.messageReply) uid = event.messageReply.senderID;
    else if (!args[0]) uid = event.senderID;
    else if (args[0].match(regExCheckURL)) {
      try {
        uid = await findUid(args[0]);
      } catch {
        return message.reply("❌ Invalid profile link.");
      }
    } else {
      const mentions = Object.keys(event.mentions || {});
      uid = mentions[0] || event.senderID;
    }

    const wait = await message.reply("⏳ Please wait few seconds...");

    try {
      const userInfo = await api.getUserInfo(uid);
      const user = userInfo[uid];
      const name = (await usersData.get(uid))?.nickName || user.name || "Unknown";
      const avatarUrl = await usersData.getAvatarUrl(uid) || `https://graph.facebook.com/${uid}/picture?type=large`;

      const buffer = await createNeonBanner(name, uid, avatarUrl);

      const cachePath = path.join(__dirname, "cache");
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
      const filePath = path.join(cachePath, `uid_neon_${uid}.png`);
      fs.writeFileSync(filePath, buffer);

      await message.unsend(wait.messageID);

      // Send banner image + text together
      return message.reply({
        body: `🆔: ${uid}\n`,
        attachment: fs.createReadStream(filePath)
      });

    } catch (err) {
      await message.unsend(wait.messageID);
      return message.reply("❌ Error: " + err.message);
    }
  }
};
