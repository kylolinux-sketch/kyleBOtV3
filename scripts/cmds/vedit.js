const axios = require("axios");

module.exports = {
  config: {
    name: "vedit",
    version: "0.0.1",
    author: "Christus",
    category: "fun",
    role: 0,
    shortDescription: "Transformer une photo en courte vidéo d'animation AI."
  },

  onStart: async function ({ api: a, event: e, args: t }) {
    const f = t.join(" ");
    if (!f)
      return a.sendMessage("❌ Veuillez fournir une description !\nExemple : anime girl dancing", e.threadID, e.messageID);

    let p = f;
    let d = 5;
    const m = f.match(/\|\s*(\d+)s?/i);
    if (m) {
      d = parseInt(m[1]);
      p = f.replace(/\|\s*\d+s?/i, "").trim();
    }

    if (
      !e.messageReply ||
      !e.messageReply.attachments ||
      e.messageReply.attachments.length === 0 ||
      e.messageReply.attachments[0].type !== "photo"
    ) {
      return a.sendMessage("❌ Veuillez répondre à une photo avec cette commande !", e.threadID, e.messageID);
    }

    const u = e.messageReply.attachments[0].url;
    a.sendMessage("🎬 Génération de l'animation, veuillez patienter...", e.threadID, e.messageID);

    try {
      const apiUrl = `http://65.109.80.126:20409/aryan/aniedit?image_url=${encodeURIComponent(u)}&prompt=${encodeURIComponent(p)}&duration=${d}`;
      const { data: s } = await axios.get(apiUrl, { timeout: 120000 });

      if (!s.status || !s.video_url) throw new Error(s.message || "Impossible d'obtenir l'URL de la vidéo.");

      const v = s.video_url;
      const { data: c } = await axios.get(v, { responseType: "stream", timeout: 60000 });

      a.sendMessage(
        {
          body: `✅ Terminé !\n📝 Description : ${p}\n🕒 Durée : ${d}s`,
          attachment: c
        },
        e.threadID,
        e.messageID
      );
    } catch (err) {
      let msg = "❌ Échec de la génération de l'animation !";
      if (err.response?.data?.message) msg += `\nErreur API : ${err.response.data.message}`;
      else if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT")
        msg = "❌ La génération de l'animation a expiré. Veuillez réessayer.";
      a.sendMessage(msg, e.threadID, e.messageID);
    }
  }
};
