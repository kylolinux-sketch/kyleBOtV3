const axios = require("axios");

module.exports = {
 config: {
 name: "monitor",
 version: "1.1.0",
 author: "kyle",
 countDown: 5,
 role: 0,
 shortDescription: {
 en: "Create or rename uptime monitor"
 },
 description: {
 en: "Create UptimeRobot monitor or rename an existing one"
 },
 category: "system",
 guide: {
 en: "{p}monitor [name] [url]\n{p}monitor rename [id] [newName]"
 }
 },

 onStart: async function ({ api, event, args }) {
 if (args.length < 1) {
 return api.sendMessage("❌ Usage:\n{p}monitor [name] [url]\n{p}monitor rename [id] [newName]", event.threadID, event.messageID);
 }

 const subCommand = args[0].toLowerCase();

 // === Rename monitor ===
 if (subCommand === "rename") {
 if (args.length < 3) {
 return api.sendMessage("❌ Usage:\n{p}monitor rename [id] [newName]", event.threadID, event.messageID);
 }

 const id = args[1];
 const newName = args.slice(2).join(" ");

 try {
 const res = await axios.get("https://web-api-delta.vercel.app/upt/rename", {
 params: { id, name: newName }
 });

 const result = res.data;

 if (result.error) {
 return api.sendMessage(`⚠️ Rename Failed: ${result.error}`, event.threadID, event.messageID);
 }

 const updated = result.data;
 return api.sendMessage(`✅ Monitor Renamed!\n🆔 ID: ${updated.id}\n📛 New Name: ${updated.name}`, event.threadID, event.messageID);
 } catch (e) {
 return api.sendMessage(`🚫 API request failed!\n${e.message}`, event.threadID, event.messageID);
 }
 }

 // === Create monitor ===
 if (args.length < 2) {
 return api.sendMessage("❌ Usage:\n{p}monitor [name] [url]", event.threadID, event.messageID);
 }

 const name = args[0];
 const url = args[1];
 const interval = 300;

 if (!url.startsWith("http")) {
 return api.sendMessage("❌ Please provide a valid URL!", event.threadID, event.messageID);
 }

 try {
 const res = await axios.get("https://web-api-delta.vercel.app/upt", {
 params: { name, url, interval }
 });

 const result = res.data;

 if (result.error) {
 return api.sendMessage(`⚠️ Error: ${result.error}`, event.threadID, event.messageID);
 }

 const monitor = result.data;
 const msg = `✅ Monitor Created Successfully!\n━━━━━━━━━━━━━━\n🆔 ID: ${monitor.id}\n📛 Name: ${monitor.name}\n🔗 URL: ${monitor.url}\n⏱️ Interval: ${monitor.interval / 60} mins\n📶 Status: ${monitor.status == 1 ? "Active ✅" : "Inactive ❌"}`;
 return api.sendMessage(msg, event.threadID, event.messageID);
 } catch (e) {
 return api.sendMessage(`🚫 API request failed!\n${e.message}`, event.threadID, event.messageID);
 }
 }
};
