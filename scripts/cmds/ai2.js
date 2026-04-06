const axios = require('axios');
const moment = require("moment-timezone");

function getManilaTime() {
  return moment.tz('Asia/Manila').format('MMMM D, YYYY h:mm A');
}

function convertToBold(text) {
  const boldMap = {
    'a':'𝗮','b':'𝗯','c':'𝗰','d':'𝗱','e':'𝗲','f':'𝗳','g':'𝗴','h':'𝗵','i':'𝗶','j':'𝗷', 
    'k':'𝗸','l':'𝗹','m':'𝗺','n':'𝗻','o':'𝗼','p':'𝗽','q':'𝗾','r':'𝗿','s':'𝘀','t':'𝘁', 
    'u':'𝘂','v':'𝘃','w':'𝘄','x':'𝘅','y':'𝘆','z':'𝘇', 
    'A':'𝗔','B':'𝗕','C':'𝗖','D':'𝗗','E':'𝗘','F':'𝗙','G':'𝗚','H':'𝗛','I':'𝗜','J':'𝗝', 
    'K':'𝗞','L':'𝗟','M':'𝗠','N':'𝗡','O':'𝗢','P':'𝗣','Q':'𝗤','R':'𝗥','S':'𝗦','T':'𝗧', 
    'U':'𝗨','V':'𝗩','W':'𝗪','X':'𝗫','Y':'𝗬','Z':'𝗭' 
  };
  return text.split('').map(c => boldMap[c] || c).join('');
}

const Prefixes = ['gpt', 'ai', 'robot', 'bot', 'cci'];
const conversationMemory = {};
const MAX_MEMORY = 10;
const replyTracker = {};

module.exports = {
  config: {
    name: 'ai',
    version: '2.7.0',
    author: 'Kyletheintrovert',
    role: 0,
    category: 'ai',
    shortDescription: { en: 'Asks an AI for an answer.' },
    longDescription: { en: 'Asks an AI and continues the conversation.' },
    guide: { en: '{pn} [prompt]' }
  },
  langs: {
    en: {
      final: "📚 𝗞𝗬𝗟𝗘'𝗦 𝗕𝗢𝗧",
      loading: "🔍 Searching..."
    }
  },
  onStart: async function () {},
  onChat: async function ({ api, event, getLang, message }) {
    try {
      if (!event.body) return;
      const body = event.body.trim();
      const lower = body.toLowerCase();
      const prefix = Prefixes.find(p => lower === p || lower.startsWith(p + " "));
      if (!prefix) return;
      const prompt = body.slice(prefix.length).trim();
      if (!prompt) {
        await message.reply(
          "👋 Hello! I'm 𝗞𝘆𝗹𝗲'𝘀 𝗖𝗵𝗮𝘁𝗯𝗼𝘁 🤖\n\nAsk me anything and I’ll remember our conversation ✨"
        );
        return;
      }
      await handleAI({ api, event, message, prompt, getLang });
    } catch (err) {
      console.error(err);
    }
  },
  onReply: async function ({ api, event, message, getLang }) {
    try {
      if (!event.body) return;
      const repliedID = event.messageReply && event.messageReply.messageID;
      if (!repliedID || !replyTracker[repliedID]) return;
      const prompt = event.body.trim();
      await handleAI({ api, event, message, prompt, getLang });
    } catch (err) {
      console.error(err);
    }
  }
};

async function handleAI({ api, event, message, prompt, getLang }) {
  const threadID = event.threadID;
  if (!conversationMemory[threadID]) {
    conversationMemory[threadID] = [];
  }
  conversationMemory[threadID].push({ role: "user", content: prompt });
  while (conversationMemory[threadID].length > MAX_MEMORY) {
    conversationMemory[threadID].shift();
  }
  const loadingReply = await message.reply(getLang("loading"));
  try {
    const response = await axios.get("https://metakexbyneokex.fly.dev/chat", {
      params: {
        prompt: conversationMemory[threadID].map(m => `${m.role}: ${m.content}`).join("\n")
      }
      // timeout removed, will wait indefinitely
    });
    if (!response.data || typeof response.data.response !== "string") {
      await api.editMessage(
        "❌ No response received. Please try again.",
        loadingReply.messageID,
        threadID
      );
      return;
    }
    const formatted = response.data.response
      .replace(/\*\*(.*?)\*\*/g, (_, t) => convertToBold(t))
      .replace(/##(.*?)##/g, (_, t) => convertToBold(t))
      .replace(/###\s*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    conversationMemory[threadID].push({ role: "assistant", content: formatted });
    const finalMsg = `${getLang("final")} 📆 | ⏰ 𝗗𝗔𝗧𝗘 & 𝗧𝗜𝗠𝗘:
    ${getManilaTime()}
    
    ${formatted}`;
    await api.editMessage(finalMsg, loadingReply.messageID, threadID);
    replyTracker[loadingReply.messageID] = threadID;
  } catch (error) {
    console.error(error);
    await api.editMessage(
      "⚠️ Error fetching AI response.\nPlease try again.",
      loadingReply.messageID,
      threadID
    );
  }
}
