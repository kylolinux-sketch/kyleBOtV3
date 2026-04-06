const fs = require("fs-extra");
const axios = require("axios");
const request = require("request");
const tinyurl = require("tinyurl");

function loadAutoLinkStates() {
  try {
    const data = fs.readFileSync("autolink.json", "utf8");
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function saveAutoLinkStates(states) {
  fs.writeFileSync("autolink.json", JSON.stringify(states, null, 2));
}

let autoLinkStates = loadAutoLinkStates();

module.exports = {
  config: {
    name: 'autolink',
    version: '3.5',
    author: 'Anthony',
    countDown: 5,
    role: 0,
    shortDescription: 'Auto-download and send videos with title and description',
    category: 'media',
  },

  onStart: async function ({ api, event }) {
  },

  onChat: async function ({ api, event }) {
    const threadID = event.threadID;
    const message = event.body;

    const linkMatch = message.match(/(https?:\/\/[^\s]+)/);
    if (!linkMatch) return;

    const url = linkMatch[0];

    api.setMessageReaction("📥", event.messageID, () => {}, true);

    try {
      const res = await axios.get(`http://65.109.80.126:20409/alldown?url=${encodeURIComponent(url)}`);
      if (!res.data.data || (!res.data.data.high && !res.data.data.low)) {
        return api.sendMessage("⚠️ Couldn't find a high or low-quality video link.", event.threadID, event.messageID);
      }

      const { title, high, low, description } = res.data.data;

      const highTinyUrl = await getTinyUrl(high);
      const lowTinyUrl = await getTinyUrl(low);

      const msg = `🎥 𝐕𝐢𝐝𝐞𝐨 𝐓𝐢𝐭𝐥𝐞 : ${title}\n\n📄 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧 : ${description || "No description available."}\n\n📥 𝐓𝐢𝐧𝐲𝐮𝐫𝐥 :\n- [𝐇𝐢𝐠𝐡𝐭 𝐐𝐮𝐚𝐥𝐢𝐭𝐲]\n(${highTinyUrl})\n- [𝐋𝐨𝐰 𝐐𝐮𝐚𝐥𝐢𝐭𝐲]\n(${lowTinyUrl})\n\n🎬 𝐄𝐧𝐣𝐨𝐲 𝐭𝐡𝐞 𝐕𝐢𝐝𝐞𝐨!!`;

      const videoUrl = high || low; // Use high link, fallback to low if not available

      request(videoUrl).pipe(fs.createWriteStream("video.mp4")).on("close", () => {
        api.sendMessage(
          {
            body: msg,
            attachment: fs.createReadStream("video.mp4")
          },
          event.threadID,
          () => {
            fs.unlinkSync("video.mp4");
          }
        );
      });

    } catch (err) {
      console.error("Error fetching video:", err);
      api.sendMessage("\n", event.threadID, event.messageID);
    }
  }
};

async function getTinyUrl(url) {
  return new Promise((resolve, reject) => {
    tinyurl.shorten(url, function(result) {
      if (result.includes("error")) {
        reject(new Error("Failed to generate TinyURL"));
      } else {
        resolve(result);
      }
    });
  });
  }
