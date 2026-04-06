const axios = require("axios");

module.exports = {
  config: {
    name: "caption",
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    description: "Obtenir une légende aléatoire depuis la catégorie sélectionnée",
    category: "media",
    guide: {
      fr: "{pn} <catégorie>"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      // Liste des catégories disponibles
      const availableCats = [
        "anime",
        "attitude",
        "alone",
        "breakup",
        "birthday",
        "emotional",
        "friendship",
        "funny",
        "islamic",
        "love",
        "motivational",
        "romantic",
        "sad",
        "success",
        "advice"
      ];

      let cat = args[0];

      // Vérification si l'utilisateur n'a pas précisé de catégorie
      if (!cat) {
        return message.reply(`📚 Catégories disponibles :\n• ${availableCats.join(" • ")}`);
      }

      cat = cat.toLowerCase();

      // Vérification si la catégorie est valide
      if (!availableCats.includes(cat)) {
        return message.reply(`❌ Catégorie invalide !\n\n📚 Catégories disponibles :\n• ${availableCats.join(" • ")}`);
      }

      // Récupération de l'API de base
      const apiBaseRes = await axios.get("https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json");
      const apiBase = apiBaseRes.data?.apiv1;

      if (!apiBase) return message.reply("❌ URL de l'API introuvable dans ApiUrl.json.");

      // Requête pour obtenir une légende aléatoire
      const url = `${apiBase}/api/caption?cat=${encodeURIComponent(cat)}`;
      const res = await axios.get(url);

      if (!res.data?.result) {
        return message.reply("❌ Aucune légende trouvée pour cette catégorie.");
      }

      const { bn, en } = res.data.result;

      // Message final stylé
      const text = `
💬 Légende aléatoire

🌸 Bangla :
${bn}

🌎 Anglais :
${en}
`;

      await message.reply(text.trim());

    } catch (e) {
      console.error(e);
      message.reply("❌ Une erreur est survenue. Veuillez réessayer plus tard.");
    }
  }
};
