const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "daily",
		version: "1.2",
		author: "Christus",
		countDown: 5,
		role: 0,
		description: {
			fr: "Recevoir votre cadeau quotidien"
		},
		category: "jeu",
		guide: {
			fr: "   {pn} : Recevoir le cadeau du jour"
				+ "\n   {pn} info : Voir les informations des cadeaux quotidiens"
		},
		envConfig: {
			rewardFirstDay: {
				coin: 100,
				exp: 10
			}
		}
	},

	langs: {
		fr: {
			monday: "Lundi",
			tuesday: "Mardi",
			wednesday: "Mercredi",
			thursday: "Jeudi",
			friday: "Vendredi",
			saturday: "Samedi",
			sunday: "Dimanche",
			alreadyReceived: "🎁 Vous avez déjà reçu votre cadeau aujourd'hui !",
			received: "🎉 Vous avez reçu %1 coins et %2 points d'expérience !"
		}
	},

	onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
		const reward = envCommands[commandName].rewardFirstDay;

		// Affichage des infos des récompenses quotidiennes
		if (args[0] === "info") {
			let msg = "📅 Récompenses quotidiennes :\n\n";
			for (let i = 1; i < 8; i++) {
				const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((i === 0 ? 7 : i) - 1));
				const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((i === 0 ? 7 : i) - 1));
				const day = i === 7 ? getLang("sunday") :
							i === 6 ? getLang("saturday") :
							i === 5 ? getLang("friday") :
							i === 4 ? getLang("thursday") :
							i === 3 ? getLang("wednesday") :
							i === 2 ? getLang("tuesday") :
							getLang("monday");
				msg += `• ${day} : ${getCoin} coins, ${getExp} XP\n`;
			}
			return message.reply(msg);
		}

		const dateTime = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
		const date = new Date();
		const currentDay = date.getDay(); // 0: dimanche, 1: lundi, 2: mardi...
		const { senderID } = event;

		const userData = await usersData.get(senderID);
		if (userData.data.lastTimeGetReward === dateTime)
			return message.reply(getLang("alreadyReceived"));

		const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((currentDay === 0 ? 7 : currentDay) - 1));
		const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((currentDay === 0 ? 7 : currentDay) - 1));
		userData.data.lastTimeGetReward = dateTime;
		await usersData.set(senderID, {
			money: userData.money + getCoin,
			exp: userData.exp + getExp,
			data: userData.data
		});

		message.reply(getLang("received", getCoin, getExp));
	}
};
