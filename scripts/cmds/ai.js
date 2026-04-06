const axios = require('axios');

// Function to pick a random emoji based on prompt keywords
function getRandomEmoji(prompt) {
    const emojiMap = {
        coding: ['💻', '🤖', '🚀', '⚙️'],
        love: ['💖', '✨', '🌸', '🥺'],
        funny: ['😂', '🤣', '💀', '👻'],
        sad: ['😢', '🩹', '🫂', '☁️'],
        default: ['🧠', '⚡', '🤖', '✨', '✅', '💠']
    };
    
    const lowerPrompt = prompt.toLowerCase();
    let pool = emojiMap.default;
    
    if (lowerPrompt.includes('code') || lowerPrompt.includes('js')) pool = emojiMap.coding;
    else if (lowerPrompt.includes('love') || lowerPrompt.includes('crush')) pool = emojiMap.love;
    else if (lowerPrompt.includes('joke') || lowerPrompt.includes('haha')) pool = emojiMap.funny;
    
    return pool[Math.floor(Math.random() * pool.length)];
}

function convertToBold(text) {
    const boldMap = {
        'a': '𝗮','b': '𝗯','c': '𝗰','d': '𝗱','e': '𝗲','f': '𝗳','g': '𝗴','h': '𝗵','i': '𝗶','j': '𝗷',
        'k': '𝗸','l': '𝗹','m': '𝗺','n': '𝗻','o': '𝗼','p': '𝗽','q': '𝗾','r': '𝗿','s': '𝘀','t': '𝘁',
        'u': '𝘂','v': '𝘃','w': '𝘄','x': '𝗅','y': '𝘆','z': '𝘇',
        'A': '𝗔','B': '𝗕','C': '𝗖','D': '𝗗','E': '𝗘','F': '𝗙','G': '𝗚','H': '𝗛','I': '𝗜','J': '𝗝',
        'K': '𝗞','L': '𝗟','M': '𝗠','N': '𝗡','O': '𝗢','P': '𝗣','Q': '𝗤','R': '𝗥','S': '𝗦','T': '𝗧',
        'U': '𝗨','V': '𝗩','W': '𝗪','X': '𝗫','Y': '𝗬','Z': '𝗭',
    };
    return text.split('').map(char => boldMap[char] || char).join('');
}

const Prefixes = ['gpt', 'ai', 'robot', 'bot', 'zephyrus'];

module.exports = {
    config: {
        name: 'ai',
        version: '3.0.0',
        author: 'Kylepogi x Gemini',
        role: 0,
        category: 'ai',
        shortDescription: { en: 'Asks an AI for an answer.' },
        longDescription: { en: 'Asks an AI with Meta AI style typing and emoji generation.' },
        guide: { en: '{pn} [prompt]' },
    },

    langs: {
        en: {
            final: "📚 𝗞𝗬𝗟𝗘'𝗦 𝗕𝗢𝗧 ",
            loading: "Thinking... 💭"
        }
    },

    onStart: async function () {},

    onChat: async function ({ api, event, args, getLang, message }) {
        try {
            const body = event.body ? event.body.toLowerCase() : "";
            const prefix = Prefixes.find(p => body.startsWith(p));
            if (!prefix) return;

            const prompt = event.body.substring(prefix.length).trim();
            const { threadID, messageID, senderID } = event;

            if (!prompt) {
                return message.reply("Hello! I'm 𝗞𝘆𝗹𝗲'𝘀 𝗖𝗵𝗮𝘁𝗯𝗼𝘁. Type something after the prefix to start! 🤖");
            }

            // 1. Start "Typing..." indicator (Meta AI Style)
            api.sendTypingIndicator(threadID);

            // 2. Immediate loading feedback
            const loadingReply = await message.reply(getLang("loading"));

            // 3. Fast Date Generation (Native)
            const now = new Date();
            const formattedDateTime = now.toLocaleString('en-PH', { 
                timeZone: 'Asia/Manila', 
                month: 'long', day: 'numeric', year: 'numeric', 
                hour: 'numeric', minute: 'numeric', hour12: true 
            });

            try {
                // Fetch AI Data
                const { data } = await axios.get(
                    'https://betadash-api-swordslush-production.up.railway.app/Llama70b',
                    { params: { ask: prompt, uid: senderID } }
                );

                if (!data || !data.response) {
                    return api.editMessage("❌ No response from AI.", loadingReply.messageID, threadID);
                }

                // Format the AI response
                const formattedAIResponse = data.response
                    .replace(/\*\*(.*?)\*\*/g, (_, t) => convertToBold(t))
                    .replace(/##(.*?)##/g, (_, t) => convertToBold(t))
                    .trim();

                const emoji = getRandomEmoji(prompt);
                const userName = getLang("final");

                const finalMsg = 
`${userName} ${emoji}
━━━━━━━━━━━━━━━━━━
   📆 𝗗𝗔𝗧𝗘&𝗧𝗜𝗠𝗘:
${formattedDateTime}

⁉️ 𝗔𝘀𝗸𝗲𝗱: ${prompt}
━━━━━━━━━━━━━━━━━━
💡𝗔𝗻𝘀𝘄𝗲𝗿(𝘀):
${formattedAIResponse}`;

                // Edit message with the final result
                return api.editMessage(finalMsg, loadingReply.messageID, threadID);

            } catch (error) {
                console.error(`API Error: ${error.message}`);
                return api.editMessage(`⚠️ Error connecting to AI: ${error.message}`, loadingReply.messageID, threadID);
            }
        } catch (err) {
            console.error(err);
        }
    },
};
