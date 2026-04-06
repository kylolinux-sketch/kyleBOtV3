const axios = require("axios");

// ======================
// GLOBAL STATE
// ======================
let simEnabled = false;
const cooldown = new Map();

// ======================
// IMAGE DETECTOR (FIXED)
// ======================
function getImageUrlFromEvent(event) {
  // reply to image
  if (event.messageReply?.attachments?.length) {
    const img = event.messageReply.attachments.find(
      att => att.type === "photo" || att.type === "animated_image"
    );
    if (img?.url) return img.url;
  }

  // direct image (no reply)
  if (event.attachments?.length) {
    const img = event.attachments.find(
      att => att.type === "photo" || att.type === "animated_image"
    );
    if (img?.url) return img.url;
  }

  return null;
}

// ======================
// AI FUNCTION
// ======================
async function getSimReply(api, event, prompt) {
  try {
    const uid = event.senderID;
    let name = "User";

    // SAFE name fetch
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const user = threadInfo.userInfo?.find(u => u.id === uid);

      if (user?.name && user.name !== "Facebook User") {
        name = user.name.split(" ")[0];
      }

      if (threadInfo.nicknames?.[uid]) {
        name = threadInfo.nicknames[uid];
      }
    } catch {}

    if (!name || name === "Facebook User") {
      name = `User_${String(uid).slice(-4)}`;
    }

    const imageUrl = getImageUrlFromEvent(event);

    const res = await axios.get(
      "https://norch-project.gleeze.com/api/jea",
      {
        params: {
          prompt,
          uid,
          name,
          imageUrl: imageUrl || undefined
        },
        timeout: 20000
      }
    );

    if (!res.data?.reply) return null;

    return res.data.reply;

  } catch (err) {
    console.error("[JEA API ERROR]", err.message);
    return null;
  }
}

// ======================
// MODULE EXPORT
// ======================
module.exports = {
  config: {
    name: "jea",
    version: "4.0.0",
    author: "April Manalo (FULL IMAGE FIX)",
    role: 0,
    category: "ai",
    guide: "-jea on | off | <message> | (reply to image)"
  },

  // ======================
  // COMMAND
  // ======================
  onStart: async function ({ api, event, args }) {
    try {
      const action = args[0]?.toLowerCase();

      if (action === "on") {
        simEnabled = true;
        return api.sendMessage(
          "✅ Jea auto-reply is now ON.",
          event.threadID,
          event.messageID
        );
      }

      if (action === "off") {
        simEnabled = false;
        return api.sendMessage(
          "❌ Jea auto-reply is now OFF.",
          event.threadID,
          event.messageID
        );
      }

      const prompt = args.join(" ").trim();
      const imageUrl = getImageUrlFromEvent(event);

      // ❌ nothing provided
      if (!prompt && !imageUrl) {
        return api.sendMessage(
          "⚠️ Usage:\n-jea <message>\n(or reply to an image)",
          event.threadID,
          event.messageID
        );
      }

      const reply = await getSimReply(
        api,
        event,
        prompt || "Tignan mo to"
      );

      if (!reply) {
        return api.sendMessage(
          "⚠️ Jea is unavailable.",
          event.threadID,
          event.messageID
        );
      }

      return api.sendMessage(
        reply,
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error("[JEA onStart ERROR]", err);
    }
  },

  // ======================
  // AUTO CHAT (FIXED)
  // ======================
  onChat: async function ({ api, event }) {
    try {
      if (!simEnabled) return;
      if (event.senderID === api.getCurrentUserID()) return;

      const body = event.body?.trim() || "";
      const imageUrl = getImageUrlFromEvent(event);

      // ❌ no text AND no image
      if (!body && !imageUrl) return;

      // ignore commands
      if (body.startsWith("-")) return;

      // cooldown (5 sec)
      const now = Date.now();
      if (cooldown.get(event.senderID) > now - 5000) return;
      cooldown.set(event.senderID, now);

      console.log("[JEA AUTO]", { body, imageUrl });

      const reply = await getSimReply(
        api,
        event,
        body || "Tignan mo to"
      );

      if (!reply) return;

      await api.sendMessage(
        reply,
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error("[JEA onChat ERROR]", err);
    }
  }
};
