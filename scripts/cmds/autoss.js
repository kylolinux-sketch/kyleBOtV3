const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const cachePath = path.join(__dirname, 'cache');
const configFilePath = path.join(__dirname, 'autoss_config.json');

// Helper to get/set ON/OFF status
const getStatus = (threadID) => {
    if (!fs.existsSync(configFilePath)) return true; // Default to ON
    const config = fs.readJsonSync(configFilePath);
    return config[threadID] !== false; 
};

const setStatus = (threadID, status) => {
    let config = {};
    if (fs.existsSync(configFilePath)) config = fs.readJsonSync(configFilePath);
    config[threadID] = status;
    fs.writeJsonSync(configFilePath, config);
};

module.exports = {
    config: {
        name: "autoss",
        version: "4.6",
        aliases: ["detectweb", "ss"],
        author: "kylepogi & Gemini",
        cooldown: 3,
        role: 0,
        shortDescription: "Detect website & Toggle Auto-SS",
        longDescription: "Automatically detects links or takes screenshots. Use 'autoss off' to disable auto-detect.",
        category: "url",
        guide: {
            en: "{pn} [url] | {pn} [on/off]",
        },
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID, senderID } = event;
        const query = args[0]?.toLowerCase();

        if (query === "off") {
            setStatus(threadID, false);
            return api.sendMessage("🚫 Auto-detection is now OFF for this chat.", threadID);
        }
        if (query === "on") {
            setStatus(threadID, true);
            return api.sendMessage("✅ Auto-detection is now ON for this chat.", threadID);
        }

        // Handle Manual Screenshot (Supports plain domains now)
        if (query && (query.startsWith("http") || query.includes("."))) {
            const link = query.startsWith("http") ? query : `https://${query}`;
            return takeAndSendScreenshot(api, event, link);
        }

        return api.sendMessage("Usage: {pn} [on/off] to toggle auto-detect, or {pn} [url] for manual screenshot.", threadID);
    },

    onChat: async function ({ api, event }) {
        const { threadID, body, senderID } = event;
        if (!body || !getStatus(threadID)) return;
        if (senderID === api.getCurrentUserID()) return;

        // UPDATED REGEX: Automatically detects links with or without http/https
        // This catches: https://google.com, http://test.com, AND plain google.com
        const urlRegex = /((https?:\/\/[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\/[^\s]*)?))/g;
        const match = body.match(urlRegex);

        if (match) {
            let detectedUrl = match[0];
            
            // Fix formatting for the screenshot API if http is missing
            if (!detectedUrl.startsWith("http")) {
                detectedUrl = "https://" + detectedUrl;
            }

            console.log(`[AutoSS] Link detected: ${detectedUrl}`);
            return takeAndSendScreenshot(api, event, detectedUrl, true);
        }
    }
};

async function takeAndSendScreenshot(api, event, url, isAuto = false) {
    const { threadID, messageID, senderID } = event;
    const screenshotPath = path.join(cachePath, `ss_${Date.now()}.png`);

    try {
        const info = await api.getUserInfo(senderID);
        const senderName = info[senderID]?.name || "User";

        if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

        const ssUrl = `https://image.thum.io/get/width/1920/crop/400/fullpage/noanimate/${url}`;
        const response = await axios.get(ssUrl, { responseType: "arraybuffer" });
        
        fs.writeFileSync(screenshotPath, Buffer.from(response.data));

        const msgBody = isAuto 
            ? `📸 | 𝗦𝗰𝗿𝗲𝗲𝗻𝘀𝗵𝗼𝘁&𝗟𝗶𝗻𝗸 𝗱𝗲𝘁𝗲𝗰𝘁𝗲𝗱.\n━━━━━━━━━━━━━━━━━━\n👤 𝗦𝗲𝗻𝗱𝗲𝗿: ${senderName}(${senderID})\n🔗 𝗟𝗶𝗻𝗸: ${url}\n\nHere's the screenshot image:`
            : `📸 | 𝗦𝗰𝗿𝗲𝗲𝗻𝘀𝗵𝗼𝘁 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱\n👤 𝗥𝗲quested by: ${senderName}\n🔗 ${url}`;

        return api.sendMessage({
            body: msgBody,
            mentions: [{
                tag: `@${senderName}`,
                id: senderID
            }],
            attachment: fs.createReadStream(screenshotPath)
        }, threadID, () => {
            if (fs.existsSync(screenshotPath)) fs.unlinkSync(screenshotPath);
        }, messageID);

    } catch (err) {
        // Only log errors in console for auto-detect to avoid spamming the chat
        console.error(err);
        if (!isAuto) api.sendMessage(`❌ Error: Could not capture ${url}`, threadID, messageID);
    }
}
