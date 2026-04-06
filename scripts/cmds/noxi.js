const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");
fs.ensureDirSync(CACHE_DIR);

module.exports = {
  config: {
    name: "noxi",
    version: "6.3",
    author: "Kyle",
    countDown: 5,
    role: 0,
    shortDescription: "🔞 Search and download Noxi videos",
    longDescription: "Search + stylized navigation with single or multiple downloads",
    category: "notcmd",
    guide: {
      fr: "{p}noxi <keyword> → search Noxi\n→ reply with number, 'all', 'next' or 'prev'"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    const query = args.join(" ");
    if (!query) return message.reply("⛩ | Please enter a keyword to search on Noxi.");

    try {
      const res = await axios.get(`https://delirius-apiofc.vercel.app/search/xnxxsearch?query=${encodeURIComponent(query)}`);
      const data = res.data.data;

      if (!data || data.length === 0) return message.reply("❌ | No results found.");

      const pageSize = 9;
      const page = 1;
      const totalPages = Math.ceil(data.length / pageSize);

      const styled = renderPage(data, query, page, pageSize, totalPages);
      const msg = await message.reply(styled);

      global.GoatBot.onReply.set(msg.messageID, {
        commandName: "noxi",
        author: event.senderID,
        data,
        query,
        page,
        pageSize
      });
    } catch (e) {
      console.error(e);
      message.reply("❌ | Error during search.");
    }
  },

  onReply: async function ({ event, api, message, Reply }) {
    const { data, author, query, page, pageSize } = Reply;
    if (event.senderID !== author) return;

    const input = event.body.trim().toLowerCase();
    const totalPages = Math.ceil(data.length / pageSize);
    let newPage = page;

    if (input === "next") newPage++;
    else if (input === "prev") newPage--;
    else if (input === "all") {
      await message.reply("📦 Downloading the first 9 videos (low quality)...");
      for (const item of data.slice(0, 9)) {
        try {
          const dl = await axios.get(`https://delirius-apiofc.vercel.app/download/xnxxdl?url=${encodeURIComponent(item.link)}`);
          const video = dl.data.data;
          const filePath = path.join(CACHE_DIR, `${Date.now()}.mp4`);

          // Download start message
          const processingMsg = await api.sendMessage({
            body: `📥 Video #${data.indexOf(item) + 1} [Quality: low] is downloading... Please wait... ♻️`
          }, event.threadID);

          await global.utils.downloadFile(video.download.low, filePath);

          // Remove processing message
          await api.unsendMessage(processingMsg.messageID);

          await api.sendMessage({
            body: `✅ Video #${data.indexOf(item) + 1} [Quality: low] downloaded successfully\n\n🎞『 ${video.title} 』\n👁 Views: ${video.views} | ⏳ Duration: ${video.duration} | ⚙ Quality: low`,
            attachment: fs.createReadStream(filePath)
          }, event.threadID, () => fs.unlinkSync(filePath));

          // OK reaction
          await api.setMessageReaction("✅", event.messageID, () => { }, true);
        } catch (err) {
          console.log("❌ Error on a video:", err.message);
          await api.setMessageReaction("❌", event.messageID, () => { }, true);
        }
      }
      return;
    } else {
      const parts = input.split(" ");
      const num = parseInt(parts[0]);
      const quality = parts[1] || "low";

      if (!num || num < 1 || num > data.length)
        return message.reply("❌ | Invalid number.");

      try {
        // Download start message
        const processingMsg = await api.sendMessage({
          body: `📥 Video #${num} [Quality: ${quality}] is downloading... Please wait... ♻️`
        }, event.threadID);

        const dl = await axios.get(`https://delirius-apiofc.vercel.app/download/xnxxdl?url=${encodeURIComponent(data[num - 1].link)}`);
        const video = dl.data.data;

        // Available qualities
        const availableQualities = Object.keys(video.download || {}).join(", ");
        if (!video.download?.[quality]) {
          await api.unsendMessage(processingMsg.messageID);
          return message.reply(`❌ | The quality "${quality}" is not available.\n\nAvailable qualities: ${availableQualities}`);
        }

        const videoUrl = video.download[quality];
        const filePath = path.join(CACHE_DIR, `${Date.now()}.mp4`);
        await global.utils.downloadFile(videoUrl, filePath);

        // Remove processing message
        await api.unsendMessage(processingMsg.messageID);

        await api.sendMessage({
          body: `✅ Video #${num} [Quality: ${quality}] downloaded successfully\n\n🎌『 ${video.title} 』\n👁 Views: ${video.views}\n⏳ Duration: ${video.duration}\n⚙ Quality: ${quality}\n\nOther available qualities: ${availableQualities}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));

        // OK reaction
        await api.setMessageReaction("✅", event.messageID, () => { }, true);
      } catch (err) {
        console.error(err);
        await api.setMessageReaction("❌", event.messageID, () => { }, true);
        message.reply("❌ | Download failed.");
      }
      return;
    }

    if (newPage < 1 || newPage > totalPages)
      return message.reply("⛔ Invalid page.");

    const styled = renderPage(data, query, newPage, pageSize, totalPages);
    const msg = await message.reply(styled);

    global.GoatBot.onReply.set(msg.messageID, {
      commandName: "noxi",
      author,
      data,
      query,
      page: newPage,
      pageSize
    });
  }
};

// -------------------
// Display functions
// -------------------

function formatViews(views) {
  if (!views) return "0";
  if (typeof views === "string") views = views.replace(/[^\d.]/g, "");
  views = Number(views);
  if (isNaN(views)) return "0";
  if (views >= 1e6) return (views / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (views >= 1e3) return (views / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
  return views.toString();
}

function renderPage(data, query, page, pageSize, totalPages) {
  const start = (page - 1) * pageSize;
  const pageData = data.slice(start, start + pageSize);

  const list = pageData.map((item, i) => {
    const views = formatViews(item.views);
    // Static display of percentage at 100% as in the example
    const percentage = "100%";
    const qualities = "low, high";

    // Duration + author, author left-aligned, duration right-aligned (~20 chars)
    const author = item.author ? item.author.trim() : "";
    const duration = item.duration || "";

    const authorDuration = author
      ? `${author.padEnd(20, " ")}${duration}`
      : duration;

    return `🎌 ${start + i + 1}. 『 ${item.title} 』\n` +
           `👁 ${views}   💯 ${percentage}   🕒 ${authorDuration}\n` +
           `⚙ Qualities: ${qualities}`;
  }).join("\n\n");

  return `📺 𝗡𝗢𝗫𝗜 𝗥𝗘𝗦𝗨𝗟𝗧𝗦 🔞 (Page ${page}/${totalPages})\n` +
         `━━━━━━━━━━━━━━━━━━\n` +
         `🔍 Keyword: *${query}*\n\n` +
         `${list}\n` +
         `━━━━━━━━━━━━━━━━━━\n` +
         `📥 Reply with:\n` +
         `• a number (1-${data.length}) + optionally "low", "high", "hd"\n` +
         `• Example: "2 hd" or "1"\n` +
         `• "all" to receive everything\n` +
         `• "next" or "prev" to navigate.`;
}
