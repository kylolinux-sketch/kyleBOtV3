const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "calculator",
    version: "1.0",
    author: "Christus",
    role: 0,
    usePrefix: true, 
    shortDescription: "Image de calculatrice stylée via API",
    longDescription: "Génère une image de calculatrice stylée avec votre expression via API",
    category: "tools",
    guide: "{pn} [expression] → ex. {pn} 123+456",
    countDown: 3
  },

  onStart: async ({ message, args }) => {
    try {
      if (!args.length || !args.join("").match(/^[0-9+\-*/().\s]+$/)) {
        return message.reply(
          "⚠️ Vous avez mal utilisé la commande calculatrice !\n\n" +
          "✅ Exemples d'utilisation correcte :\n" +
          "`/calculator 123+456` → Additionner des nombres\n" +
          "`/calculator (12*3)-5` → Expression complexe\n\n" +
          "💡 Utilisez uniquement des chiffres et des opérateurs (+, -, *, /, (, )) dans l'expression."
        );
      }

      const expression = args.join(" ").trim();

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(cacheDir, "calculator.png");

      const apiUrl = `https://xsaim8x-xxx-api.onrender.com/api/calculator?calculate=${encodeURIComponent(expression)}`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      fs.writeFileSync(filePath, buffer);

      return message.reply({ attachment: fs.createReadStream(filePath) });

    } catch (err) {
      console.error("❌ Erreur commande calculatrice :", err.message);
      return message.reply(
        "❌ Impossible de générer l'image de la calculatrice.\n💬 Contactez l'auteur pour de l'aide : https://m.me/ye.bi.nobi.tai.244493"
      );
    }
  }
};
