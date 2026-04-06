const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "ban",
		version: "1.4",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			fr: "Interdit un membre du groupe de discussion"
		},
		category: "groupe",
		guide: {
			fr: "   {pn} [@tag|uid|lien fb|réponse] [<raison>|laisser vide si aucune raison] : Bannir un membre du groupe"
				+ "\n   {pn} check : Vérifier les membres bannis et les expulser du groupe"
				+ "\n   {pn} unban [@tag|uid|lien fb|réponse] : Retirer le bannissement d'un membre"
				+ "\n   {pn} list : Voir la liste des membres bannis"
		}
	},

	langs: {
		fr: {
			notFoundTarget: "⚠️ | Veuillez taguer la personne à bannir, ou entrer son UID, son lien FB, ou répondre à son message",
			notFoundTargetUnban: "⚠️ | Veuillez taguer la personne à débannir, ou entrer son UID, son lien FB, ou répondre à son message",
			userNotBanned: "⚠️ | La personne avec l'ID %1 n'est pas bannie de ce groupe",
			unbannedSuccess: "✅ | %1 a été débanni avec succès !",
			cantSelfBan: "⚠️ | Vous ne pouvez pas vous bannir vous-même !",
			cantBanAdmin: "❌ | Vous ne pouvez pas bannir un administrateur !",
			existedBan: "❌ | Cette personne est déjà bannie !",
			noReason: "Aucune raison",
			bannedSuccess: "✅ | %1 a été banni du groupe !",
			needAdmin: "⚠️ | Le bot a besoin des droits administrateur pour expulser les membres bannis",
			noName: "Utilisateur Facebook",
			noData: "📑 | Aucun membre n'est actuellement banni dans ce groupe",
			listBanned: "📑 | Liste des membres bannis dans ce groupe (page %1/%2)",
			content: "%1/ %2 (%3)\nRaison : %4\nHeure du bannissement : %5\n\n",
			needAdminToKick: "⚠️ | Le membre %1 (%2) est banni, mais le bot n'a pas les droits administrateur pour l'expulser, merci de lui accorder les droits administrateur",
			bannedKick: "⚠️ | %1 a déjà été banni !\nUID : %2\nRaison : %3\nHeure du bannissement : %4\n\nLe bot a automatiquement expulsé ce membre"
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang, usersData, api }) {
		const { members, adminIDs } = await threadsData.get(event.threadID);
		const { senderID } = event;
		let target;
		let reason;

		const dataBanned = await threadsData.get(event.threadID, 'data.banned_ban', []);

		// --- Débannir un membre ---
		if (args[0] === 'unban') {
			if (!isNaN(args[1])) target = args[1];
			else if (args[1]?.startsWith('https')) target = await findUid(args[1]);
			else if (Object.keys(event.mentions || {}).length) target = Object.keys(event.mentions)[0];
			else if (event.messageReply?.senderID) target = event.messageReply.senderID;
			else return api.sendMessage(getLang('notFoundTargetUnban'), event.threadID, event.messageID);

			const index = dataBanned.findIndex(item => item.id == target);
			if (index === -1) return api.sendMessage(getLang('userNotBanned', target), event.threadID, event.messageID);

			dataBanned.splice(index, 1);
			await threadsData.set(event.threadID, dataBanned, 'data.banned_ban');
			const userName = members[target]?.name || await usersData.getName(target) || getLang('noName');

			return api.sendMessage(getLang('unbannedSuccess', userName), event.threadID, event.messageID);
		}

		// --- Vérifier les membres bannis ---
		else if (args[0] === "check") {
			if (!dataBanned.length) return;
			for (const user of dataBanned) {
				if (event.participantIDs.includes(user.id))
					api.removeUserFromGroup(user.id, event.threadID);
			}
		}

		// --- Identifier la cible ---
const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "ban",
    version: "1.5",
    author: "Christus",
    countDown: 5,
    role: 1,
    description: {
      fr: "Bannir un membre du chat",
      en: "Ban user from box chat"
    },
    category: "box chat",
    guide: {
      fr: "{pn} [@tag|uid|lien fb|répondre] [<raison>|laisser vide] : Bannir un membre\n" +
          "{pn} check : Vérifier les membres bannis et les expulser\n" +
          "{pn} unban [@tag|uid|lien fb|répondre] : Débannir un membre\n" +
          "{pn} list : Voir la liste des membres bannis",
      en: "{pn} [@tag|uid|fb link|reply] [<reason>|leave blank] : Ban a member\n" +
          "{pn} check : Check banned members and kick them\n" +
          "{pn} unban [@tag|uid|fb link|reply] : Unban a member\n" +
          "{pn} list : View list of banned members"
    }
  },

  langs: {
    fr: {
      notFoundTarget: "⚠️ | Veuillez taguer la personne à bannir ou entrer son UID / lien FB ou répondre à son message",
      notFoundTargetUnban: "⚠️ | Veuillez taguer la personne à débannir ou entrer son UID / lien FB ou répondre à son message",
      userNotBanned: "⚠️ | L'utilisateur avec l'ID %1 n'est pas banni de ce chat",
      unbannedSuccess: "✅ | %1 a été débanni du chat !",
      cantSelfBan: "⚠️ | Vous ne pouvez pas vous bannir vous-même !",
      cantBanAdmin: "❌ | Vous ne pouvez pas bannir un administrateur !",
      existedBan: "❌ | Cette personne est déjà bannie !",
      noReason: "Aucune raison",
      bannedSuccess: "✅ | %1 a été banni du chat !",
      needAdmin: "⚠️ | Le bot a besoin des droits administrateur pour expulser les membres bannis",
      noName: "Utilisateur Facebook",
      noData: "📑 | Aucun membre n'est banni dans ce chat",
      listBanned: "📑 | Liste des membres bannis (page %1/%2)",
      content: "%1/ %2 (%3)\nRaison : %4\nHeure du bannissement : %5\n\n",
      needAdminToKick: "⚠️ | Le membre %1 (%2) est banni mais le bot n'a pas les droits administrateur pour l'expulser, merci de donner les droits administrateur",
      bannedKick: "⚠️ | %1 a déjà été banni !\nUID: %2\nRaison: %3\nHeure du bannissement: %4\n\nLe bot a expulsé automatiquement ce membre"
    },
    en: {
      notFoundTarget: "⚠️ | Please tag the person to ban or enter UID / FB link or reply to their message",
      notFoundTargetUnban: "⚠️ | Please tag the person to unban or enter UID / FB link or reply to their message",
      userNotBanned: "⚠️ | The user with ID %1 is not banned from this chat",
      unbannedSuccess: "✅ | %1 has been unbanned from chat!",
      cantSelfBan: "⚠️ | You can't ban yourself!",
      cantBanAdmin: "❌ | You can't ban an admin!",
      existedBan: "❌ | This person is already banned!",
      noReason: "No reason",
      bannedSuccess: "✅ | %1 has been banned from chat!",
      needAdmin: "⚠️ | Bot needs admin rights to kick banned members",
      noName: "Facebook user",
      noData: "📑 | No banned members in this chat",
      listBanned: "📑 | List of banned members (page %1/%2)",
      content: "%1/ %2 (%3)\nReason: %4\nBan time: %5\n\n",
      needAdminToKick: "⚠️ | Member %1 (%2) is banned but bot does not have admin rights to kick them, please grant admin rights",
      bannedKick: "⚠️ | %1 was already banned!\nUID: %2\nReason: %3\nBan time: %4\n\nBot automatically kicked this member"
    }
  },

  onStart: async function ({ message, event, args, threadsData, getLang, usersData, api }) {
    const { members, adminIDs } = await threadsData.get(event.threadID);
    const { senderID } = event;
    let target;
    let reason;

    const dataBanned = await threadsData.get(event.threadID, 'data.banned_ban', []);

    // --- Débannir ---
    if (args[0] === 'unban') {
      if (!isNaN(args[1])) target = args[1];
      else if (args[1]?.startsWith('https')) target = await findUid(args[1]);
      else if (Object.keys(event.mentions || {}).length) target = Object.keys(event.mentions)[0];
      else if (event.messageReply?.senderID) target = event.messageReply.senderID;
      else return api.sendMessage(getLang('notFoundTargetUnban'), event.threadID, event.messageID);

      const index = dataBanned.findIndex(item => item.id == target);
      if (index === -1) return api.sendMessage(getLang('userNotBanned', target), event.threadID, event.messageID);

      dataBanned.splice(index, 1);
      await threadsData.set(event.threadID, dataBanned, 'data.banned_ban');
      const userName = members[target]?.name || await usersData.getName(target) || getLang('noName');
      return api.sendMessage(getLang('unbannedSuccess', userName), event.threadID, event.messageID);
    }

    // --- Check des membres bannis ---
    if (args[0] === 'check') {
      if (!dataBanned.length) return;
      for (const user of dataBanned) {
        if (event.participantIDs.includes(user.id))
          api.removeUserFromGroup(user.id, event.threadID);
      }
      return;
    }

    // --- Liste des bannis ---
    if (args[0] === 'list') {
      if (!dataBanned.length) return message.reply(getLang('noData'));
      const limit = 20;
      const page = parseInt(args[1] || 1);
      const start = (page - 1) * limit;
      const end = page * limit;
      const data = dataBanned.slice(start, end);

      let msg = '';
      let count = 0;
      for (const user of data) {
        count++;
        const name = members[user.id]?.name || await usersData.getName(user.id) || getLang('noName');
        msg += getLang('content', start + count, name, user.id, user.reason, user.time);
      }
      return message.reply(getLang('listBanned', page, Math.ceil(dataBanned.length / limit)) + '\n\n' + msg);
    }

    // --- Déterminer la cible ---
    if (event.messageReply?.senderID) {
      target = event.messageReply.senderID;
      reason = args.join(' ');
    } else if (Object.keys(event.mentions || {}).length) {
      target = Object.keys(event.mentions)[0];
      reason = args.join(' ').replace(event.mentions[target], '');
    } else if (!isNaN(args[0])) {
      target = args[0];
      reason = args.slice(1).join(' ');
    } else if (args[0]?.startsWith('https')) {
      target = await findUid(args[0]);
      reason = args.slice(1).join(' ');
    } else {
      return message.reply(getLang('notFoundTarget'));
    }

    if (target == senderID) return message.reply(getLang('cantSelfBan'));
    if (adminIDs.includes(target)) return message.reply(getLang('cantBanAdmin'));

    const banned = dataBanned.find(item => item.id == target);
    if (banned) return message.reply(getLang('existedBan'));

    const name = members[target]?.name || (await usersData.getName(target)) || getLang('noName');
    const time = moment().tz(global.GoatBot.config.timeZone).format('HH:mm:ss DD/MM/YYYY');
    dataBanned.push({ id: target, reason: reason || getLang('noReason'), time });
    await threadsData.set(event.threadID, dataBanned, 'data.banned_ban');

    message.reply(getLang('bannedSuccess', name), () => {
      if (members.some(item => item.userID == target)) {
        if (adminIDs.includes(api.getCurrentUserID())) {
          if (event.participantIDs.includes(target))
            api.removeUserFromGroup(target, event.threadID);
        } else {
          message.send(getLang('needAdmin'), (err, info) => {
            global.GoatBot.onEvent.push({
              messageID: info.messageID,
              onStart: ({ event }) => {
                if (event.logMessageType === "log:thread-admins" &&
                    event.logMessageData.ADMIN_EVENT == "add_admin") {
                  const { TARGET_ID } = event.logMessageData;
                  if (TARGET_ID == api.getCurrentUserID()) {
                    api.removeUserFromGroup(target, event.threadID, () =>
                      global.GoatBot.onEvent = global.GoatBot.onEvent.filter(item => item.messageID != info.messageID)
                    );
                  }
                }
              }
            });
          });
        }
      }
    });
  },

  onEvent: async function ({ event, api, threadsData, getLang, message }) {
    if (event.logMessageType === "log:subscribe") {
      const { threadID } = event;
      const dataBanned = await threadsData.get(threadID, 'data.banned_ban', []);
      const usersAdded = event.logMessageData.addedParticipants;

      for (const user of usersAdded) {
        const { userFbId, fullName } = user;
        const banned = dataBanned.find(item => item.id == userFbId);
        if (banned) {
          const reason = banned.reason || getLang('noReason');
          const time = banned.time;
          api.removeUserFromGroup(userFbId, threadID, err => {
            if (err)
              return message.send(getLang('needAdminToKick', fullName, userFbId));
            else
              message.send(getLang('bannedKick', fullName, userFbId, reason, time));
          });
        }
      }
    }
  }
};
