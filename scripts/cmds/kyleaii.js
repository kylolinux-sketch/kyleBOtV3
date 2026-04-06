/* cmd install kyleai.js */

const axios = require("axios");
const moment = require("moment-timezone");

const MAX_MEMORY = 12;
const PREFIX = "kyleaii";
const memory = {};
const Prefixes = ['gpt', 'ai', 'robot', 'bot', 'zephyrus'];

const autoReplyStatus = {}; // NEW: store autoreply status

// Store conversation memory
function pushMemory(uid, role, content) {
  if (!memory[uid]) memory[uid] = [];

  memory[uid].push({ role, content });

  if (memory[uid].length > MAX_MEMORY) {
    memory[uid].shift();
  }
}

// Detect creation question
function isCreationQuestion(text) {
  const t = text.toLowerCase();
  return (
    t.includes("who created you") ||
    t.includes("who developed you") ||
    t.includes("who deployed you")
  );
}

// Manila time
function getManilaTime() {
  return moment.tz("Asia/Manila").format("MMMM D, YYYY h:mm A");
}

// Bold converter
function convertToBold(text) {
   const boldMap = {
  'a':'𝗮','b':'𝗯','c':'𝗰','d':'𝗱','e':'𝗲','f':'𝗳','g':'𝗴','h':'𝗵','i':'𝗶','j':'𝗷',
  'k':'𝗸','l':'𝗹','m':'𝗺','n':'𝗻','o':'𝗼','p':'𝗽','q':'𝗾','r':'𝗿','s':'𝘀','t':'𝘁',
  'u':'𝘂','v':'𝘃','w':'𝘄','x':'𝘅','y':'𝘆','z':'𝘇',

  'A':'𝗔','B':'𝗕','C':'𝗖','D':'𝗗','E':'𝗘','F':'𝗙','G':'𝗚','H':'𝗛','I':'𝗜','J':'𝗝',
  'K':'𝗞','L':'𝗟','M':'𝗠','N':'𝗡','O':'𝗢','P':'𝗣','Q':'𝗤','R':'𝗥','S':'𝗦','T':'𝗧',
  'U':'𝗨','V':'𝗩','W':'𝗪','X':'𝗫','Y':'𝗬','Z':'𝗭',

  '0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰',
  '5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵'
};

  return text.split("").map(c => boldMap[c] || c).join("");
}

// Count total words
function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Format AI output
function formatResponse(response) {
  return response
    .replace(/\*\*(.*?)\*\*/g, (_, t) => convertToBold(t))
    .replace(/##(.*?)##/g, (_, t) => convertToBold(t))
    .replace(/###\s*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

module.exports = {
  config: {
    name: "kyleaii",
    version: "1.6.0",
    author: "kyletheintrovert",
    role: 0,
    category: "ai",
    shortDescription: "Kyle's AI with advanced messaging features.",
  },

  onStart: async function () {},


  onChat: async function ({ api, event }) {
    const msg = (event.body || "").trim();
    if (!msg) return;

    const threadID = event.threadID;
    const lower = msg.toLowerCase();
  onReply: async function ({ api, event, Reply }) {
    if (!Reply) return;

    const msg = (event.body || "").trim();
    if (!msg) return;

    return talk(api, event, msg);
  },

};

async function talk(api, event, question) {
  const uid = event.senderID;
  let loadingMsg;

  try {

    const userInfo = await api.getUserInfo(uid);
    const userNameTag = userInfo[uid]?.name || "User";

    // Typing Animation
    loadingMsg = await new Promise((resolve, reject) => {
      api.sendMessage(
        "🤖 Kyle's AI is typing.",
        event.threadID,
        (err, info) => {
          if (err) return reject(err);
          resolve(info);
        }
      );
    });

    await new Promise(r => setTimeout(r, 700));
    await api.editMessage("🤖 Kyle's AI is typing..", loadingMsg.messageID);

    await new Promise(r => setTimeout(r, 700));
    await api.editMessage("🤖 Kyle's AI is typing...", loadingMsg.messageID);


    if (isCreationQuestion(question)) {
      const forced =
        "I was created by Kyle Bait-it and configured as well as developed by Kyle's AI.";

      return api.editMessage(
`📚 𝗞𝗬𝗟𝗘'𝗦 𝗔𝗜 🤖

📆 | ⏰ ${getManilaTime()}

❓ 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: “${question}”
👤 𝗔𝘀𝗸𝗲𝗱 𝗯𝘆: ${userNameTag}(${uid})
━━━━━━━━━━━━━━━━━━━━━━━
💡 ${forced}
━━━━━━━━━━━━━━━━━━━━━━━
📋 𝗧𝗼𝘁𝗮𝗹 𝗪𝗼𝗿𝗱𝘀: (${countWords(forced)})`,
        loadingMsg.messageID
      );
    }

    pushMemory(uid, "user", question);

    const apis = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json');
    const apiss = apis.data.api;

    const response = await axios.get(`${apiss}/nayan/gpt3?prompt=${encodeURIComponent(question)}`);

    const aiResponse = response.data.response || 'I am unable to process your request at the moment.';

    let answer =
      aiResponse.trim() ||
      "Kyle's AI is still thinking...";

    pushMemory(uid, "assistant", answer);

    answer = formatResponse(answer);

    const totalWords =
      countWords(question) + countWords(answer);

    const formattedAnswer =
`📚 𝗞𝗬𝗟𝗘'𝗦 𝗔𝗜 🤖

📆 | ⏰ ${getManilaTime()}

❓ 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: “${question}”
👤 𝗔𝘀𝗸𝗲𝗱 𝗯𝘆: ${userNameTag}(${uid})
━━━━━━━━━━━━━━━━━━━━━━━
💡 ${answer}
━━━━━━━━━━━━━━━━━━━━━━━
📋 𝗧𝗼𝘁𝗮𝗹 𝗪𝗼𝗿𝗱𝘀: (${totalWords})`;

    await api.editMessage(
      formattedAnswer,
      loadingMsg.messageID
    );

    // ENABLE REPLY
    global.GoatBot.onReply.set(loadingMsg.messageID, {
      commandName: "kyleaii",
      author: uid
    });

  } catch (error) {
    console.error("Error in AI processing:", error);
    if (loadingMsg?.messageID) {
      await api.editMessage(
        "⛔ Sorry, Kyle's AI couldn't respond right now. Please try again later.",
        lo
