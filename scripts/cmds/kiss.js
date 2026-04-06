const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

const bgURL = "https://files.catbox.moe/20pg09.jpg";
const localBgPath = path.join(__dirname, "cache", "kiss_bg.jpg");

const avatarConfig = {
  boy: { x: 255, y: 50, size: 107 },
  girl: { x: 367, y: 160, size: 97 }
};

module.exports = {
  config: {
    name: "kiss",
    version: "2.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    description:
      "💋 Crée une image romantique de baiser entre toi et la personne taguée ! Cette commande fusionne joliment les avatars sur un fond élégant pour capturer le moment parfait du baiser. Il suffit de taguer quelqu’un ou de répondre à son message pour partager un baiser virtuel plein d’amour ! 💞",
    category: "love",
    guide: {
      en: "{pn} @tag ou répondre au message de quelqu’un — Crée une image romantique de baiser 💋"
    }
  },

  langs: {
    en: {
      noTag: "Veuillez taguer quelqu’un ou répondre à son message pour utiliser cette commande 💋"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    const uid1 = event.senderID;
    let uid2 = Object.keys(event.mentions)[0];

    if (!uid2 && event.messageReply?.senderID)
      uid2 = event.messageReply.senderID;

    if (!uid2)
      return message.reply(getLang("noTag"));

    try {
      const name1 = (await usersData.getName(uid1)) || "Inconnu";
      const name2 =
        (await usersData.getName(uid2)) ||
        (event.mentions[uid2]
          ? event.mentions[uid2].replace("@", "")
          : "Inconnu");

      await fs.ensureDir(path.dirname(localBgPath));
      if (!fs.existsSync(localBgPath)) {
        const bgRes = await axios.get(bgURL, { responseType: "arraybuffer" });
        await fs.writeFile(localBgPath, bgRes.data);
      }

      const [avatarURL1, avatarURL2] = await Promise.all([
        usersData.getAvatarUrl(uid1),
        usersData.getAvatarUrl(uid2)
      ]);

      const [boy, girl, bgImg] = await Promise.all([
        loadImage(avatarURL1).catch(() => null),
        loadImage(avatarURL2).catch(() => null),
        loadImage(localBgPath)
      ]);

      if (!boy || !girl)
        throw new Error("Échec du chargement des avatars.");

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0);

      function drawCircle(img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      drawCircle(boy, avatarConfig.boy.x, avatarConfig.boy.y, avatarConfig.boy.size);
      drawCircle(girl, avatarConfig.girl.x, avatarConfig.girl.y, avatarConfig.girl.size);

      const savePath = path.join(__dirname, "tmp");
      await fs.ensureDir(savePath);
      const imgPath = path.join(savePath, `${uid1}_${uid2}_kiss.jpg`);
      await fs.writeFile(imgPath, canvas.toBuffer("image/jpeg"));

      const text = `💋 ${name1} vient de faire un bisou à ${name2} ! ❤️`;

      await message.reply({
        body: text,
        attachment: fs.createReadStream(imgPath)
      });

      setTimeout(() => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }, 5000);

    } catch (err) {
      console.error("❌ Erreur dans kiss.js :", err);
      return message.reply("❌ | Impossible de créer l'image du baiser, veuillez réessayer plus tard.");
    }
  }
};
