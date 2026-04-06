function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
	config: {
		name: "filteruser",
		version: "1.6",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			fr: "Filtrer les membres du groupe selon le nombre de messages ou si le compte est verrouillé"
		},
		category: "discussion de groupe",
		guide: {
			fr: "   {pn} [<nombre de messages> | die]"
		}
	},

	langs: {
		fr: {
			needAdmin: "⚠️ | Veuillez ajouter le bot en tant qu'administrateur du groupe pour utiliser cette commande",
			confirm: "⚠️ | Êtes-vous sûr de vouloir supprimer les membres du groupe ayant moins de %1 messages ?\nRéagissez à ce message pour confirmer",
			kickByBlock: "✅ | %1 membres avec un compte verrouillé ont été supprimés avec succès",
			kickByMsg: "✅ | %1 membres ayant moins de %2 messages ont été supprimés avec succès",
			kickError: "❌ | Une erreur est survenue et il est impossible de supprimer %1 membres :\n%2",
			noBlock: "✅ | Aucun membre avec un compte verrouillé",
			noMsg: "✅ | Aucun membre n'a moins de %1 messages"
		}
	},

	onStart: async function ({ api, args, threadsData, message, event, commandName, getLang }) {
		const threadData = await threadsData.get(event.threadID);
		if (!threadData.adminIDs.includes(api.getCurrentUserID()))
			return message.reply(getLang("needAdmin"));

		if (!isNaN(args[0])) {
			message.reply(getLang("confirm", args[0]), (err, info) => {
				global.GoatBot.onReaction.set(info.messageID, {
					author: event.senderID,
					messageID: info.messageID,
					minimum: Number(args[0]),
					commandName
				});
			});
		}
		else if (args[0] == "die") {
			const threadData = await api.getThreadInfo(event.threadID);
			const membersBlocked = threadData.userInfo.filter(user => user.type !== "User");
			const errors = [];
			const success = [];
			for (const user of membersBlocked) {
				if (user.type !== "User" && !threadData.adminIDs.some(id => id == user.id)) {
					try {
						await api.removeUserFromGroup(user.id, event.threadID);
						success.push(user.id);
					}
					catch (e) {
						errors.push(user.name);
					}
					await sleep(700);
				}
			}

			let msg = "";
			if (success.length > 0)
				msg += `${getLang("kickByBlock", success.length)}\n`;
			if (errors.length > 0)
				msg += `${getLang("kickError", errors.length, errors.join("\n"))}\n`;
			if (msg == "")
				msg += getLang("noBlock");
			message.reply(msg);
		}
		else
			message.SyntaxError();
	},

	onReaction: async function ({ api, Reaction, event, threadsData, message, getLang }) {
		const { minimum = 1, author } = Reaction;
		if (event.userID != author)
			return;
		const threadData = await threadsData.get(event.threadID);
		const botID = api.getCurrentUserID();
		const membersCountLess = threadData.members.filter(member =>
			member.count < minimum
			&& member.inGroup == true
			// ignorer le bot et les admins
			&& member.userID != botID
			&& !threadData.adminIDs.some(id => id == member.userID)
		);
		const errors = [];
		const success = [];
		for (const member of membersCountLess) {
			try {
				await api.removeUserFromGroup(member.userID, event.threadID);
				success.push(member.userID);
			}
			catch (e) {
				errors.push(member.name);
			}
			await sleep(700);
		}

		let msg = "";
		if (success.length > 0)
			msg += `${getLang("kickByMsg", success.length, minimum)}\n`;
		if (errors.length > 0)
			msg += `${getLang("kickError", errors.length, errors.join("\n"))}\n`;
		if (msg == "")
			msg += getLang("noMsg", minimum);
		message.reply(msg);
	}
};
