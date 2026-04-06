module.exports = {
 config: {
  name: "setting",
  version: "1.0.5",
  author: "Christus",
  countDown: 5,
  role: 2,
  shortDescription: {
   fr: "Panneau de configuration du bot"
  },
  longDescription: {
   fr: "Panneau de configuration et de gestion du bot"
  },
  category: "admin",
  guide: {
   fr: "Envoyez la commande pour voir le panneau de contrôle"
  }
 },

 langs: {
  fr: {
   panelTitle: "🛠 | Panneau de Configuration du Bot | 🛠",
   settingsTitle: "📁 GESTION DES PARAMÈTRES",
   activityTitle: "⚙️ GESTION DES ACTIVITÉS",
   option1: "🥇 ➊ Préfixe",
   option2: "🤖 ➋ Nom du Bot",
   option3: "🧑‍💼 ➌ Liste des Admins",
   option4: "🌐 Langue",
   option5: "🔁 Redémarrage Auto",
   option6: "🆙 Vérifier les Mises à Jour",
   option7: "👤 Utilisateurs Bannis",
   option8: "👥 Groupes Bannís",
   option9: "📢 Envoyer un Annonce à Tous",
   option10: "🔍 🔟 Trouver UID par Nom",
   option11: "🧭 ⓫ Trouver ID du Groupe par Nom",
   option12: "🎭 ⓬ Changer l’Émoji du Groupe",
   option13: "📝 ⓭ Changer le Nom du Groupe",
   option14: "📊 ⓮ Voir les Infos du Groupe",
   selectPrompt: "Répondez avec le numéro pour choisir une option",
   autoRestart: "🔁 Le bot redémarrera automatiquement tous les jours à 12h00",
   currentVersion: "📦 Version actuelle : ",
   bannedUsers: "🔒 %1 utilisateurs bannis\n\n%2",
   bannedThreads: "🚫 %1 groupes bannis\n\n%2",
   announcementPrompt: "📢 Répondez avec le message à envoyer à tous les groupes",
   findUidPrompt: "🔍 Répondez avec le nom d’utilisateur pour trouver l’UID",
   findThreadPrompt: "🧭 Répondez avec le nom du groupe pour trouver l’ID",
   emojiPrompt: "🎭 Répondez avec le nouvel émoji",
   namePrompt: "📝 Répondez avec le nouveau nom du groupe",
   announcementSent: "✅ Envoyé à : %1 groupes\n❌ Échec : %2 groupes",
   threadInfo: "📊 Infos du Groupe :\n\n✨ Nom : %1\n🆔 ID : %2\n👀 Approbation : %3\n🎭 Émoji : %4\n👥 Membres : %5\n👨 Hommes : %6\n👩 Femmes : %7\n🛡️ Admins : %8\n💬 Total messages : %9",
   noResult: "❌ Aucun résultat correspondant trouvé"
  }
 },

 onStart: async function ({ message, event, args, getLang }) {
  if (!args[0]) {
   const panelMessage = [
    "╔🛠️ 𝗣𝗔𝗡𝗡𝗘𝗔𝗨 𝗗𝗘 𝗖𝗢𝗡𝗧𝗥𝗢𝗟 𝗗𝗨 𝗕𝗢𝗧 🛠️╗",
    "║",
    `║ 📁 GESTION DES PARAMÈTRES`,
    `║ ${getLang("option1")}`,
    `║ ${getLang("option2")}`,
    `║ ${getLang("option3")}`,
    `║ ${getLang("option4")}`,
    `║ ${getLang("option5")}`,
    "║",
    `║ ⚙️ GESTION DES ACTIVITÉS`,
    `║ ${getLang("option6")}`,
    `║ ${getLang("option7")}`,
    `║ ${getLang("option8")}`,
    `║ ${getLang("option9")}`,
    `║ ${getLang("option10")}`,
    `║ ${getLang("option11")}`,
    `║ ${getLang("option12")}`,
    `║ ${getLang("option13")}`,
    `║ ${getLang("option14")}`,
    "║",
    `╚ 💬 ${getLang("selectPrompt")} ╝`
   ].join("\n");

   return message.reply(panelMessage, (err, info) => {
    global.GoatBot.onReply.set(info.messageID, {
     commandName: this.config.name,
     author: event.senderID,
     type: "choose"
    });
   });
  }
 },

 onReply: async function ({ api, event, message, Reply, threadsData, usersData, getLang }) {
  const { type, author } = Reply;
  if (event.senderID !== author) return;

  const choice = event.body;

  switch (type) {
   case "choose":
    switch (choice) {
     case "1":
      return message.reply(`📌 Préfixe du Bot : ${global.GoatBot.config.prefix}`);
     case "2":
      return message.reply(`🤖 Nom du Bot : ${global.GoatBot.config.botName}`);
     case "3": {
      const adminList = await Promise.all(global.GoatBot.config.adminBot.map(async id => {
       const name = await usersData.getName(id);
       return `👤 ${name} - ${id}`;
      }));
      return message.reply(`🛡️ Admins:\n\n${adminList.join("\n")}`);
     }
     case "4":
      return message.reply(`🌐 Langue : ${global.GoatBot.config.language}`);
     case "5":
      return message.reply(getLang("autoRestart"));
     case "6":
      return message.reply(getLang("currentVersion") + this.config.version);
     case "7": {
      const bannedUsers = global.GoatBot.bannedUsers;
      const list = await Promise.all([...bannedUsers.entries()].map(async ([id, reason], i) => {
       const name = await usersData.getName(id);
       return `${i + 1}. ${name} (${id})\n🚫 Raison : ${reason}`;
      }));
      return message.reply(getLang("bannedUsers", bannedUsers.size, list.join("\n\n")));
     }
     case "8": {
      const bannedThreads = global.GoatBot.bannedThreads;
      const list = await Promise.all([...bannedThreads.entries()].map(async ([id, reason], i) => {
       const thread = await threadsData.get(id);
       return `${i + 1}. ${thread.threadName} (${id})\n🚫 Raison : ${reason}`;
      }));
      return message.reply(getLang("bannedThreads", bannedThreads.size, list.join("\n\n")));
     }
     case "9":
      return message.reply(getLang("announcementPrompt"), (err, info) => {
       global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        type: "sendAnnouncement"
       });
      });
     case "10":
      return message.reply(getLang("findUidPrompt"), (err, info) => {
       global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        type: "findUid"
       });
      });
     case "11":
      return message.reply(getLang("findThreadPrompt"), (err, info) => {
       global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        type: "findThread"
       });
      });
     case "12":
      return message.reply(getLang("emojiPrompt"), (err, info) => {
       global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        type: "changeEmoji"
       });
      });
     case "13":
      return message.reply(getLang("namePrompt"), (err, info) => {
       global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        type: "changeName"
       });
      });
     case "14": {
      const thread = await threadsData.get(event.threadID);
      let male = 0, female = 0;

      for (const mem of thread.members) {
       const user = await usersData.get(mem.userID);
       if (user.gender === "MALE") male++;
       if (user.gender === "FEMALE") female++;
      }

      return message.reply(getLang("threadInfo",
       thread.threadName,
       thread.threadID,
       thread.approvalMode ? "Activé" : "Désactivé",
       thread.emoji,
       thread.members.length,
       male,
       female,
       thread.adminIDs.length,
       thread.messageCount
      ));
     }
     default: return message.reply(getLang("noResult"));
    }
    break;

   case "sendAnnouncement": {
    const threads = await threadsData.getAll();
    const name = await usersData.getName(event.senderID);
    let success = 0, fail = 0;

    for (const thread of threads) {
     if (thread.threadID === event.threadID) continue;
     try {
      await message.send(`📢 Annonce de l'admin ${name}:\n\n${event.body}`, thread.threadID);
      success++;
      await new Promise(res => setTimeout(res, 300));
     } catch {
      fail++;
     }
    }

    return message.reply(getLang("announcementSent", success, fail));
   }

   case "findUid": {
    try {
     const name = event.body;
     const result = await api.searchUsers(name);
     if (!result.length) return message.reply(getLang("noResult"));

     return message.reply(result.map(user => `👤 ${user.name} - UID: ${user.userID}`).join("\n"));
    } catch {
     return message.reply(getLang("noResult"));
    }
   }

   case "findThread": {
    try {
     const name = event.body.toLowerCase();
     const threads = await threadsData.getAll();
     const result = threads.filter(t => t.threadName.toLowerCase().includes(name));
     if (!result.length) return message.reply(getLang("noResult"));

     return message.reply(result.map((t, i) => `${i + 1}. ${t.threadName} - ${t.threadID}`).join("\n"));
    } catch {
     return message.reply(getLang("noResult"));
    }
   }

   case "changeEmoji":
    try {
     await api.changeThreadEmoji(event.body, event.threadID);
     return message.reply(`🎭 Émoji mis à jour : ${event.body}`);
    } catch {
     return message.reply("❌ Échec de la mise à jour de l’émoji");
    }

   case "changeName":
    try {
     await api.setTitle(event.body, event.threadID);
     return message.reply(`📝 Nom du groupe changé en : ${event.body}`);
    } catch {
     return message.reply("❌ Échec du changement de nom");
    }
  }
 }
};
