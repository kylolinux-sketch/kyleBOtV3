const cron = require('node-cron');

module.exports = {
 config: {
 name: "automsg",
 version: "2.0",
 author: "Kyle",
 role: 1, // Admin-only
 description: "Hourly wisdom with time, motivation & growth tips",
 category: "life",
 guide: { en: "{prefix}automsg [start/stop]" }
 },

 onStart: async function({ api, event, args }) {
 const action = args[0]?.toLowerCase();
 const threadID = event.threadID;

 // Wisdom database
 const wisdomBank = {
 motivation: [
 "🚀 Your potential is endless - take one small step today",
 "🔥 Obstacles are detours in the right direction",
 "✨ The world needs your unique gifts - don't dim your light"
 ],
 solitude: [
 "🌿 Solitude is where creativity blooms - enjoy your own company",
 "🧘 Try a 5-minute digital detox this hour",
 "🌌 In silence, we hear our deepest truths"
 ],
 aura: [
 "💎 Your energy precedes you - radiate kindness today",
 "🌸 Clean spaces attract positive energy - tidy one corner",
 "🔮 Speak gently - words shape reality"
 ],
 gratitude: [
 "🙏 Name 3 things you're grateful for right now",
 "🌻 Appreciate something simple you usually overlook",
 "💖 Thank someone mentally who helped you this week"
 ],
 personality: [
 "🦋 Try a new response to an old trigger today",
 "🎭 Notice when you're people-pleasing - practice authenticity",
 "🌱 Growth happens outside comfort zones"
 ]
 };

 if (action === "start") {
 if (this.timeIntervals && this.timeIntervals[threadID]) {
 return api.sendMessage("⏳ Hourly wisdom is already flowing here!", threadID);
 }

 // Schedule hourly messages
 const task = cron.schedule('0 * * * *', () => {
				const now = new Date();
				// Convert to Philippines Time (UTC+8)
				const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
				// Format time in PH style
				const timeString = phTime.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
				const dateString = phTime.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });
 // Select random wisdom
 const category = Object.keys(wisdomBank)[Math.floor(Math.random() * Object.keys(wisdomBank).length)];
 const message = wisdomBank[category][Math.floor(Math.random() * wisdomBank[category].length)];

 api.sendMessage({
 body: `🔔 𝗔𝗨𝗧𝗢 𝗠𝗦𝗚:\n━━━━━━━━━━━━━━\n⏰ 𝗧𝗶𝗺𝗲: ${timeString}\n📅 𝗗𝗮𝘁𝗲: ${dateString}\n` +
 `━━━━━━━━━━━━━━\n` +
 `✨ 𝗪𝗶𝘀𝗱𝗼𝗺 𝗼𝗳 𝘁𝗵𝗲 𝗛𝗼𝘂𝗿 ✨\n` +
 `▸ ${message}\n\n` +
 `💎 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${this.capitalizeFirstLetter(category)}\n` +
 `🌻 𝗔𝗳𝗳𝗶𝗿𝗺𝗮𝘁𝗶𝗼𝗻: "${this.generateAffirmation()}"`,
 mentions: [{
 tag: "@Community",
 id: event.senderID
 }]
 }, threadID);
 });

 // Store the interval reference
 if (!this.timeIntervals) this.timeIntervals = {};
 this.timeIntervals[threadID] = task;

 api.sendMessage("🌿 𝗛𝗼𝘂𝗿𝗹𝘆 𝗪𝗶𝘀𝗱𝗼𝗺 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱!\nExpect nourishing messages every hour with:\n• Time/Date\n• Motivational Quotes\n• Self-Growth Tips\n• Aura Boosters\n• Gratitude Prompts", threadID);

 } else if (action === "stop") {
 if (!this.timeIntervals || !this.timeIntervals[threadID]) {
 return api.sendMessage("❌ No active wisdom stream in this chat!", threadID);
 }

 this.timeIntervals[threadID].stop();
 delete this.timeIntervals[threadID];
 api.sendMessage("🕊️ Hourly wisdom paused. Use '{prefix}wisdom start' to resume.", threadID);

 } else {
 api.sendMessage("✍️ 𝗨𝘀𝗮𝗴𝗲:\n• {prefix}wisdom start - Begin hourly wisdom\n• {prefix}wisdom stop - Pause messages", threadID);
 }
 },

 // Helper methods
 capitalizeFirstLetter: function(string) {
 return string.charAt(0).toUpperCase() + string.slice(1);
 },

 generateAffirmation: function() {
 const affirmations = [
 "I attract positive energy effortlessly",
 "My challenges are opportunities in disguise",
 "I grow wiser with each experience",
 "My presence brings calm to others",
 "I am the architect of my destiny"
 ];
 return affirmations[Math.floor(Math.random() * affirmations.length)];
 },

 onChat: async function({ event, api }) {
 // Clean up if bot is removed
 if (event.logMessageType === "log:unsubscribe" && 
 event.logMessageData.leftParticipantFbId === api.getCurrentUserID()) {
 if (this.timeIntervals && this.timeIntervals[event.threadID]) {
 this.timeIntervals[event.threadID].stop();
 delete this.timeIntervals[event.threadID];
 }
 }
 }
};
