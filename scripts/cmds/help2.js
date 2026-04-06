module.exports = {
  config: {
    name: "help2",
    aliases: ["commands2","menu2"],
    version: "0.0.1",
    author: "Kyle",
    countDown: 2,
    role: 0,
    category: "utility"
  },

  onStart: async function ({ message, args, commandName }) {
    const cmds = global.GoatBot.commands;
    if (!cmds) return message.reply("Command collection is not available.");

    if (args.length) {
      const q = args[0].toLowerCase();
      const cmd = [...cmds.values()].find(
        c => c.config.name === q || (c.config.aliases && c.config.aliases.includes(q))
      );
      if (!cmd) return message.reply(`No command called “${q}”.`);
      const i = cmd.config;
      const detail = `
╭────────────────────⚘
│ ⚛︎ 𝙲𝚘𝚖𝚖𝚊𝚗𝚍: ${i.name}
│ ⚛︎ 𝙰𝚕𝚒𝚊𝚜𝚎𝚜: ${i.aliases?.length ? i.aliases.join(", ") : "None"}
│ ⚛︎ 𝙲𝚊𝚗 𝚞𝚜𝚎: ${i.role === 2 ? "Admin Only" : i.role === 1 ? "VIP Only" : "All Users"}
│ ⚛︎ 𝙲𝚊𝚝𝚎𝚐𝚘𝚛𝚢: ${i.category?.toUpperCase() || "Kyle"}
│ ⚛︎ PrefixEnabled?: ${i.prefix === false ? "False" : "True"}
│ ⚛︎ 𝙰𝚞𝚝𝚑𝚘𝚛: Kyle
│ ⚛︎ 𝚅𝚎𝚛𝚜𝚒𝚘𝚗: ${i.version || "N/A"}
╰────────────────────⚛︎
      `.trim();
      return message.reply(detail);
    }

    const cats = {};
    [...cmds.values()]
      .filter((c, i, s) => i === s.findIndex(x => x.config.name === c.config.name))
      .forEach(c => {
        const cat = c.config.category || "UNCATEGORIZED";
        if (!cats[cat]) cats[cat] = [];
        if (!cats[cat].includes(c.config.name)) cats[cat].push(c.config.name);
      });

    let msg = "🎀 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐌𝐄𝐍𝐔:\n";
    Object.keys(cats).sort().forEach(cat => {
      msg += `╭─────『 ${cat.toUpperCase()} 』\n`;
      cats[cat].sort().forEach(n => {
        msg += `│ ➣${n}✿\n`;
      });
      msg += `╰──────────────\n`;
    });

    msg += `
╭─────────────❀
│ » Total cmds: ${cmds.size}
│〢𝙆𝙍𝙄𝙀𝙎𝙃𝘼 𝘼𝙄 🎀
│ 📌 𝗛𝗼𝘄 𝘁𝗼 𝘂𝘀𝗲𝗱⁉️
│Type: ai what is artificial intelligence? 
│ type •pin cat - 10
│or Type owner - to view owner information
╰──────────❁`.trim();

    await message.reply(msg);
  }
};
