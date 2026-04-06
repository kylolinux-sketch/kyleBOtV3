module.exports = {
	config: {
		name: "onlyadminbox",
		aliases: ["onlyadbox", "adboxonly", "adminboxonly"],
		version: "1.3",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			fr: "activer/désactiver le mode où seul l'administrateur du groupe peut utiliser le bot",
			en: "turn on/off only admin box can use bot"
		},
		category: "discussion de groupe",
		guide: {
			fr: "   {pn} [on | off] : activer/désactiver le mode où seul l'administrateur du groupe peut utiliser le bot"
				+ "\n   {pn} noti [on | off] : activer/désactiver la notification lorsqu'un utilisateur non administrateur utilise le bot",
			en: "   {pn} [on | off]: turn on/off the mode only admin of group can use bot"
				+ "\n   {pn} noti [on | off]: turn on/off the notification when user is not admin of group use bot"
		}
	},

	langs: {
		fr: {
			turnedOn: "✅ Mode activé : seul l'administrateur du groupe peut utiliser le bot",
			turnedOff: "❌ Mode désactivé : tous les membres peuvent utiliser le bot",
			turnedOnNoti: "✅ Notification activée lorsqu'un utilisateur non administrateur utilise le bot",
			turnedOffNoti: "❌ Notification désactivée lorsqu'un utilisateur non administrateur utilise le bot",
			syntaxError: "⚠️ Erreur de syntaxe, utilisez uniquement {pn} on ou {pn} off"
		},
		en: {
			turnedOn: "Turned on the mode only admin of group can use bot",
			turnedOff: "Turned off the mode only admin of group can use bot",
			turnedOnNoti: "Turned on the notification when user is not admin of group use bot",
			turnedOffNoti: "Turned off the notification when user is not admin of group use bot",
			syntaxError: "Syntax error, only use {pn} on or {pn} off"
		}
	},

	onStart: async function ({ args, message, event, threadsData, getLang }) {
		let isSetNoti = false;
		let value;
		let keySetData = "data.onlyAdminBox";
		let indexGetVal = 0;

		if (args[0] === "noti") {
			isSetNoti = true;
			indexGetVal = 1;
			keySetData = "data.hideNotiMessageOnlyAdminBox";
		}

		if (args[indexGetVal] === "on")
			value = true;
		else if (args[indexGetVal] === "off")
			value = false;
		else
			return message.reply(getLang("syntaxError"));

		await threadsData.set(event.threadID, isSetNoti ? !value : value, keySetData);

		if (isSetNoti)
			return message.reply(value ? getLang("turnedOnNoti") : getLang("turnedOffNoti"));
		else
			return message.reply(value ? getLang("turnedOn") : getLang("turnedOff"));
	}
};
