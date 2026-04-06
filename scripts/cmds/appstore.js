const itunes = require("searchitunes");
const { getStreamFromURL } = global.utils;

module.exports = {
	config: {
		name: "appstore",
		version: "1.2",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			fr: "Rechercher une application sur l'App Store",
		},
		category: "logiciel",
		guide: "   {pn}: <mot-clé>"
			+ "\n   - Exemple:"
			+ "\n   {pn} PUBG",
		envConfig: {
			limitResult: 3
		}
	},

	langs: {
		fr: {
			missingKeyword: "❌ Vous n'avez pas entré de mot-clé",
			noResult: "❌ Aucun résultat trouvé pour le mot-clé : %1"
		}
	},

	onStart: async function ({ message, args, commandName, envCommands, getLang }) {
		if (!args[0])
			return message.reply(getLang("missingKeyword"));
		
		let results = [];
		try {
			results = (await itunes({
				entity: "software",
				country: "FR",
				term: args.join(" "),
				limit: envCommands[commandName].limitResult
			})).results;
		}
		catch (err) {
			return message.reply(getLang("noResult", args.join(" ")));
		}

		if (results.length > 0) {
			let msg = "";
			const pendingImages = [];
			for (const result of results) {
				msg += `\n\n- ${result.trackCensoredName} par ${result.artistName}, ${result.formattedPrice} et noté ${"🌟".repeat(result.averageUserRating)} (${result.averageUserRating.toFixed(1)}/5)`
					+ `\n- ${result.trackViewUrl}`;
				pendingImages.push(await getStreamFromURL(result.artworkUrl512 || result.artworkUrl100 || result.artworkUrl60));
			}
			message.reply({
				body: msg,
				attachment: await Promise.all(pendingImages)
			});
		} else {
			message.reply(getLang("noResult", args.join(" ")));
		}
	}
};
