const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "admin",
		version: "1.6",
		author: "Christus",
		countDown: 5,
		role: 3,
		description: {
			fr: "Ajouter, retirer ou modifier les droits d'admin",
			en: "Add, remove, edit admin role"
		},
		category: "discussion de groupe",
		guide: {
			fr: '   {pn} [add | -a] <uid | @tag> : Ajouter un admin'
				+ '\n   {pn} [remove | -r] <uid | @tag> : Retirer un admin'
				+ '\n   {pn} [list | -l] : Afficher la liste des admins',
			en: '   {pn} [add | -a] <uid | @tag> : Add admin role for user'
				+ '\n   {pn} [remove | -r] <uid | @tag> : Remove admin role of user'
				+ '\n   {pn} [list | -l] : List all admins'
		}
	},

	langs: {
		fr: {
			added: "✅ | Droits d'admin ajoutés pour %1 utilisateur(s) :\n%2",
			alreadyAdmin: "\n⚠️ | %1 utilisateur(s) étaient déjà admin :\n%2",
			missingIdAdd: "⚠️ | Veuillez entrer l'ID ou mentionner l'utilisateur à ajouter comme admin",
			removed: "✅ | Droits d'admin retirés pour %1 utilisateur(s) :\n%2",
			notAdmin: "⚠️ | %1 utilisateur(s) n'étaient pas admin :\n%2",
			missingIdRemove: "⚠️ | Veuillez entrer l'ID ou mentionner l'utilisateur à retirer comme admin",
			listAdmin: "👑 | Liste des admins :\n%1"
		},
		en: {
			added: "✅ | Added admin role for %1 users:\n%2",
			alreadyAdmin: "\n⚠️ | %1 users already have admin role:\n%2",
			missingIdAdd: "⚠️ | Please enter ID or tag user to add admin role",
			removed: "✅ | Removed admin role of %1 users:\n%2",
			notAdmin: "⚠️ | %1 users don't have admin role:\n%2",
			missingIdRemove: "⚠️ | Please enter ID or tag user to remove admin role",
			listAdmin: "👑 | List of admins:\n%1"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		switch (args[0]) {

			// Ajout d'admin
			case "add":
			case "-a": {
				if (!args[1]) return message.reply(getLang("missingIdAdd"));

				let uids = [];
				if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
				else if (event.messageReply) uids.push(event.messageReply.senderID);
				else uids = args.filter(arg => !isNaN(arg));

				const notAdminIds = [], adminIds = [];
				for (const uid of uids) {
					config.adminBot.includes(uid) ? adminIds.push(uid) : notAdminIds.push(uid);
				}

				config.adminBot.push(...notAdminIds);

				const getNames = await Promise.all(uids.map(uid =>
					usersData.getName(uid).then(name => ({ uid, name }))
				));

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				return message.reply(
					(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "") +
					(adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")
				);
			}

			// Suppression d'admin
			case "remove":
			case "-r": {
				if (!args[1]) return message.reply(getLang("missingIdRemove"));

				let uids = [];
				if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
				else uids = args.filter(arg => !isNaN(arg));

				const notAdminIds = [], adminIds = [];
				for (const uid of uids) {
					config.adminBot.includes(uid) ? adminIds.push(uid) : notAdminIds.push(uid);
				}

				for (const uid of adminIds) config.adminBot.splice(config.adminBot.indexOf(uid), 1);

				const getNames = await Promise.all(adminIds.map(uid =>
					usersData.getName(uid).then(name => ({ uid, name }))
				));

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				return message.reply(
					(adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "") +
					(notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
				);
			}

			// Liste des admins
			case "list":
			case "-l": {
				const getNames = await Promise.all(config.adminBot.map(uid =>
					usersData.getName(uid).then(name => ({ uid, name }))
				));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
			}

			default:
				return message.SyntaxError();
		}
	}
};
