const { getStreamFromURL, uploadImgbb } = global.utils;

module.exports = {
  config: {
    name: "antichangeinfobox",
    version: "1.9",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    description: {
      fr: "Activer ou désactiver la protection contre les changements d'informations de votre groupe",
    },
    category: "box chat",
    guide: {
      fr: "   {pn} avt [on | off]: protéger contre le changement d'avatar du groupe"
        + "\n   {pn} name [on | off]: protéger contre le changement de nom du groupe"
        + "\n   {pn} nickname [on | off]: protéger contre le changement de surnom des membres"
        + "\n   {pn} theme [on | off]: protéger contre le changement de thème du groupe"
        + "\n   {pn} emoji [on | off]: protéger contre le changement d'emoji du groupe",
    }
  },

  langs: {
    fr: {
      antiChangeAvatarOn: "✅ Protection activée contre le changement d'avatar du groupe",
      antiChangeAvatarOff: "❌ Protection désactivée contre le changement d'avatar du groupe",
      missingAvt: "⚠️ Aucun avatar défini pour ce groupe",
      antiChangeNameOn: "✅ Protection activée contre le changement de nom du groupe",
      antiChangeNameOff: "❌ Protection désactivée contre le changement de nom du groupe",
      antiChangeNicknameOn: "✅ Protection activée contre le changement de surnom des membres",
      antiChangeNicknameOff: "❌ Protection désactivée contre le changement de surnom des membres",
      antiChangeThemeOn: "✅ Protection activée contre le changement de thème du groupe",
      antiChangeThemeOff: "❌ Protection désactivée contre le changement de thème du groupe",
      antiChangeEmojiOn: "✅ Protection activée contre le changement d'emoji du groupe",
      antiChangeEmojiOff: "❌ Protection désactivée contre le changement d'emoji du groupe",
      antiChangeAvatarAlreadyOn: "⚠️ La protection contre le changement d'avatar est déjà activée",
      antiChangeAvatarAlreadyOnButMissingAvt: "⚠️ Protection activée, mais aucun avatar n'est défini pour ce groupe",
      antiChangeNameAlreadyOn: "⚠️ La protection contre le changement de nom est déjà activée",
      antiChangeNicknameAlreadyOn: "⚠️ La protection contre le changement de surnom est déjà activée",
      antiChangeThemeAlreadyOn: "⚠️ La protection contre le changement de thème est déjà activée",
      antiChangeEmojiAlreadyOn: "⚠️ La protection contre le changement d'emoji est déjà activée"
    }
  },

  onStart: async function ({ message, event, args, threadsData, getLang }) {
    if (!["on", "off"].includes(args[1])) return message.SyntaxError();

    const { threadID } = event;
    const dataAntiChangeInfoBox = await threadsData.get(threadID, "data.antiChangeInfoBox", {});

    async function checkAndSaveData(key, data) {
      if (args[1] === "off") delete dataAntiChangeInfoBox[key];
      else dataAntiChangeInfoBox[key] = data;

      await threadsData.set(threadID, dataAntiChangeInfoBox, "data.antiChangeInfoBox");
      message.reply(getLang(`antiChange${key.slice(0, 1).toUpperCase()}${key.slice(1)}${args[1].slice(0, 1).toUpperCase()}${args[1].slice(1)}`));
    }

    switch (args[0]) {
      case "avt":
      case "avatar":
      case "image": {
        const { imageSrc } = await threadsData.get(threadID);
        if (!imageSrc) return message.reply(getLang("missingAvt"));
        const newImageSrc = await uploadImgbb(imageSrc);
        await checkAndSaveData("avatar", newImageSrc.image.url);
        break;
      }
      case "name": {
        const { threadName } = await threadsData.get(threadID);
        await checkAndSaveData("name", threadName);
        break;
      }
      case "nickname": {
        const { members } = await threadsData.get(threadID);
        await checkAndSaveData(
          "nickname",
          members.map(u => ({ [u.userID]: u.nickname })).reduce((a, b) => ({ ...a, ...b }), {})
        );
        break;
      }
      case "theme": {
        const { threadThemeID } = await threadsData.get(threadID);
        await checkAndSaveData("theme", threadThemeID);
        break;
      }
      case "emoji": {
        const { emoji } = await threadsData.get(threadID);
        await checkAndSaveData("emoji", emoji);
        break;
      }
      default:
        return message.SyntaxError();
    }
  },

  onEvent: async function ({ message, event, threadsData, role, api, getLang }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    const dataAntiChange = await threadsData.get(threadID, "data.antiChangeInfoBox", {});

    switch (logMessageType) {
      case "log:thread-image": {
        if (!dataAntiChange.avatar || role >= 1) return;
        return async function () {
          if (api.getCurrentUserID() !== author) {
            if (dataAntiChange.avatar !== "REMOVE") {
              message.reply(getLang("antiChangeAvatarAlreadyOn"));
              api.changeGroupImage(await getStreamFromURL(dataAntiChange.avatar), threadID);
            } else {
              message.reply(getLang("antiChangeAvatarAlreadyOnButMissingAvt"));
            }
          } else {
            const imageSrc = logMessageData.url;
            if (!imageSrc) return await threadsData.set(threadID, "REMOVE", "data.antiChangeInfoBox.avatar");
            const newImageSrc = await uploadImgbb(imageSrc);
            await threadsData.set(threadID, newImageSrc.image.url, "data.antiChangeInfoBox.avatar");
          }
        };
      }
      case "log:thread-name": {
        if (!dataAntiChange.hasOwnProperty("name") || role >= 1) return;
        return async function () {
          if (api.getCurrentUserID() !== author) {
            message.reply(getLang("antiChangeNameAlreadyOn"));
            api.setTitle(dataAntiChange.name, threadID);
          } else {
            const threadName = logMessageData.name;
            await threadsData.set(threadID, threadName, "data.antiChangeInfoBox.name");
          }
        };
      }
      case "log:user-nickname": {
        if (!dataAntiChange.hasOwnProperty("nickname") || role >= 1) return;
        return async function () {
          const { nickname, participant_id } = logMessageData;
          if (api.getCurrentUserID() !== author) {
            message.reply(getLang("antiChangeNicknameAlreadyOn"));
            api.changeNickname(dataAntiChange.nickname[participant_id], threadID, participant_id);
          } else {
            await threadsData.set(threadID, nickname, `data.antiChangeInfoBox.nickname.${participant_id}`);
          }
        };
      }
      case "log:thread-color": {
        if (!dataAntiChange.hasOwnProperty("theme") || role >= 1) return;
        return async function () {
          if (api.getCurrentUserID() !== author) {
            message.reply(getLang("antiChangeThemeAlreadyOn"));
            api.changeThreadColor(dataAntiChange.theme || "196241301102133", threadID);
          } else {
            const threadThemeID = logMessageData.theme_id;
            await threadsData.set(threadID, threadThemeID, "data.antiChangeInfoBox.theme");
          }
        };
      }
      case "log:thread-icon": {
        if (!dataAntiChange.hasOwnProperty("emoji") || role >= 1) return;
        return async function () {
          if (api.getCurrentUserID() !== author) {
            message.reply(getLang("antiChangeEmojiAlreadyOn"));
            api.changeThreadEmoji(dataAntiChange.emoji, threadID);
          } else {
            const threadEmoji = logMessageData.thread_icon;
            await threadsData.set(threadID, threadEmoji, "data.antiChangeInfoBox.emoji");
          }
        };
      }
    }
  }
};
