const axios = require("axios");
const fs = require("fs");
const path = require("path");

// 📁 Fichier pour sauvegarder les tâches de chaque groupe
const TASK_JSON = path.join(__dirname, "midj_tasks.json");
if (!fs.existsSync(TASK_JSON)) fs.writeFileSync(TASK_JSON, "{}");

// ✅ Corrigé : pas d’espaces en trop dans le lien
const BASE_URL = "https://midjanuarybyxnil.onrender.com";

module.exports = {
  config: {
    name: "midj2",
    aliases: ["mj2", "midjourney2"],
    author: "Christus",
    version: "2.4",
    role: 0,
    shortDescription: "Générer des images IA en style MidJourney",
    longDescription: {
      ar: "Créer et agrandir des images style MidJourney via une interface rapide"
    },
    category: "IA",
    guide: {
      en: "{pn} <description> — pour générer une image\nRéponds par U1-U4 pour agrandir un résultat"
    }
  },

  onStart: async function ({ args, message, event }) {
    try {
      const prompt = args.join(" ").trim();
      if (!prompt) return message.reply("⚠ | Merci d’écrire une description pour l’image.");

      // 🎨 Message d’attente
      const processingMsg = await message.reply(
        "◈ ──『 Génération - Astra 』── ◈\n" +
        "✿┊🖼 | Patiente un peu mon cher... création de ton image IA en cours\n" +
        "✿┊🖌 | Ne bouge pas, je vais te surprendre avec le résultat !\n" +
        "◈ ────────────── ◈"
      );

      // 🖼 Demande de génération
      const genRes = await axios.get(`${BASE_URL}/imagine?prompt=${encodeURIComponent(prompt)}`);
      const data = genRes.data;

      console.log("[MidJourney] Response:", data);

      // ✅ Vérifier si murl existe
      if (!data || !data.murl) {
        await message.unsend(processingMsg.messageID);
        return message.reply("❌ | Échec de la génération. Réessaie.");
      }

      const taskId = data.taskId || "unknown";
      const murl = data.murl;

      // 💾 Sauvegarder la tâche
      const tasks = JSON.parse(fs.readFileSync(TASK_JSON, "utf8"));
      tasks[event.threadID] = taskId;
      fs.writeFileSync(TASK_JSON, JSON.stringify(tasks, null, 2));

      // ✅ Envoyer l’image
      await message.unsend(processingMsg.messageID);

      const imgStream = await global.utils.getStreamFromURL(murl);
      const bodyText =
        "◈ ──『 Génération - Astra 』── ◈\n" +
        "✿┊✅ Image générée avec succès !\n" +
        "✿┊🎨 Profite de ta création !\n" +
        "✿┊💬 Choisis U1 - U4 pour envoyer une partie\n" +
        "◈ ────────────── ◈";

      const sentMsg = await message.reply({
        body: bodyText,
        attachment: imgStream
      });

      // 🔁 Enregistrer pour les interactions futures
      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: this.config.name,
        taskId,
        threadID: event.threadID,
        messageID: sentMsg.messageID
      });

    } catch (err) {
      console.error("◈ ──『 Génération - Astra 』── ◈\n✿┊❌ Erreur\n◈ ────────────── ◈", err.message || err);
      message.reply(
        "◈ ──『 Génération - Astra 』── ◈\n" +
        "✿┊⚠ Impossible de générer une image avec cette description\n" +
        "✿┊Essaie une autre idée\n" +
        "◈ ────────────── ◈"
      );
    }
  },

  onReply: async function ({ event, Reply, message }) {
    try {
      const action = event.body.trim().toLowerCase();
      if (!["u1", "u2", "u3", "u4"].includes(action)) return;

      const cid = action.replace("u", "");
      const processingMsg = await message.reply(`✿┊🔄 Agrandissement de ${action.toUpperCase()}...`);

      // 📏 Demande d’upscale
      const res = await axios.get(`${BASE_URL}/up?tid=${Reply.taskId}&cid=${cid}`);
      const data = res.data;

      console.log("[Upscale] Response:", data);

      // ❌ Vérifier la présence du lien
      if (!data || !data.url) {
        await message.unsend(processingMsg.messageID);
        return message.reply(`❌ | Échec de l’agrandissement de ${action.toUpperCase()}.`);
      }

      await message.unsend(processingMsg.messageID);

      const imgStream = await global.utils.getStreamFromURL(data.url);
      const resultMsg =
        `◈ ──『 Génération - Astra 』── ◈\n` +
        `✿┊✅ ${action.toUpperCase()} agrandi avec succès !\n` +
        `✿┊💬 Tu peux répondre encore avec U1–U4.\n` +
        `◈ ────────────── ◈`;

      const sentMsg = await message.reply({
        body: resultMsg,
        attachment: imgStream
      });

      // 🔁 Mise à jour du contexte
      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: Reply.commandName,
        taskId: data.tid || Reply.taskId,
        threadID: event.threadID,
        messageID: sentMsg.messageID
      });

    } catch (err) {
      console.error("❌ Erreur de l’upscale :", err.message || err);
      message.reply("❌ | Une erreur est survenue pendant l’agrandissement.");
    }
  }
};
