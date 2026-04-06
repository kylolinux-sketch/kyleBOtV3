const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "$", "cash"],
    version: "5.1",
    author: "Kyle",
    countDown: 3,
    role: 0,
    description: "💰 Stylish economic system with transfer",
    category: "economy",
    guide: {
      fr: "{pn} - see your balance\n{pn} @user - see someone else's balance\n{pn} t @user amount - transfer money"
    }
  },

  onStart: async function ({ message, event, args, usersData }) {
    const { senderID, mentions, messageReply } = event;

    // --- Money formatting ---
    const formatMoney = (amount) => {
      if (isNaN(amount)) return "0$";
      amount = Number(amount);
      const scales = [
        { value: 1e15, suffix: 'Q' },
        { value: 1e12, suffix: 'T' },
        { value: 1e9, suffix: 'B' },
        { value: 1e6, suffix: 'M' },
        { value: 1e3, suffix: 'k' }
      ];
      const scale = scales.find(s => amount >= s.value);
      if (scale) return `${(amount / scale.value).toFixed(1)}${scale.suffix}$`;
      return `${amount.toLocaleString()}$`;
    };

    // --- Safe avatar fetch ---
    const fetchAvatar = async (userID) => {
      try {
        let avatarURL = `https://graph.facebook.com/${userID}/picture?type=large&width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const res = await axios.get(avatarURL, { responseType: "arraybuffer", timeout: 10000 });
        return await loadImage(Buffer.from(res.data));
      } catch (e) {
        const size = 100;
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#3b0066";
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${size / 2}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(userID.charAt(0).toUpperCase(), size / 2, size / 2);
        return canvas;
      }
    };

    // === MONEY TRANSFER ===
    if (args[0]?.toLowerCase() === "t") {
      let targetID = Object.keys(mentions)[0] || messageReply?.senderID;
      const amountRaw = args.find(a => !isNaN(a));
      const amount = parseFloat(amountRaw);

      if (!targetID || isNaN(amount)) return message.reply("❌ Usage : !bal t @user amount");
      if (targetID === senderID) return message.reply("❌ You cannot send money to yourself.");
      if (amount <= 0) return message.reply("❌ Amount must be greater than 0.");

      const sender = await usersData.get(senderID);
      const receiver = await usersData.get(targetID);
      if (!receiver) return message.reply("❌ Target user not found.");

      const taxRate = 5;
      const tax = Math.ceil(amount * taxRate / 100);
      const total = amount + tax;

      if (sender.money < total) return message.reply(
        `❌ Insufficient funds.\nRequired: ${formatMoney(total)}\nYou have: ${formatMoney(sender.money)}`
      );

      await Promise.all([
        usersData.set(senderID, { ...sender, money: sender.money - total }),
        usersData.set(targetID, { ...receiver, money: receiver.money + amount })
      ]);

      const receiverName = await usersData.getName(targetID);
      return message.reply(
        `✅ Transfer successful! 💸
➤ To: ${receiverName}
➤ Amount sent: ${formatMoney(amount)}
➤ Tax: ${formatMoney(tax)}
➤ Total deducted: ${formatMoney(total)}`
      );
    }

    // === BALANCE CARD ===
    let targetID;
    if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
    else if (messageReply) targetID = messageReply.senderID;
    else targetID = senderID;

    const name = await usersData.getName(targetID);
    const money = await usersData.get(targetID, "money") || 0;
    const avatar = await fetchAvatar(targetID);

    const width = 700, height = 300;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // --- Stylish gradient background ---
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#0f2027");
    gradient.addColorStop(0.5, "#203a43");
    gradient.addColorStop(1, "#2c5364");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Transparent card
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(40, 40, width - 80, height - 80);

    // Golden border
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Round avatar
    const avatarSize = 100;
    const avatarX = 70, avatarY = 130;
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Title
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("⚡ Balance Card ⚡", width / 2, 80);

    // User name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`💎 ${name}`, 200, 160);

    // User ID
    ctx.font = "22px Arial";
    ctx.fillStyle = "#AAAAAA";
    ctx.fillText(`🆔 ${targetID}`, 200, 200);

    // Balance
    ctx.font = "bold 44px Arial";
    ctx.fillStyle = "#00FF7F";
    ctx.textAlign = "center";
    ctx.fillText(`${formatMoney(money)}`, width / 2, 250);

    const filePath = path.join(__dirname, "balance_card.png");
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    return message.reply({
      body: `⚡ Balance info for ${name} ⚡`,
      attachment: fs.createReadStream(filePath)
    });
  }
};
