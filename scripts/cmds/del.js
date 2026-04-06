module.exports = {
  config: {
    name: "delete",
    aliases: ["del"],
    author: "Kylepogi",
    role: 2,
    category: "File Management"
  },

  onStart: async ({ api, event, args }) => {
    const fs = require("fs");
    const path = require("path");

    const action = args[0];
    const fileName = args[1];
    const newContent = args.slice(2).join(" ");

    if (!action)
      return api.sendMessage("⚠️ Please specify an action: delete | edit | list", event.threadID);

    let loadingMessage;
    const sendLoading = async (text) => {
      loadingMessage = await api.sendMessage(text, event.threadID);
    };

    switch (action) {
      case "delete":
      case "del":
        if (!fileName)
          return api.sendMessage("⚠️ Please provide a file to delete.", event.threadID);

        const deletePath = path.join(__dirname, fileName);

        await sendLoading(`🔄 𝗣𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝗱𝗲𝗹𝗲𝘁𝗲 𝗿𝗲𝗾𝘂𝗲𝘀𝘁\n▬▬▬▬▬▬▬▬▬▬▬▬\n🗑️ 𝑭𝒊𝒍𝒆: ${fileName}`);

        fs.unlink(deletePath, (err) => {
          if (err) {
            api.editMessage(
              `❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗱𝗲𝗹𝗲𝘁𝗲 𝗳𝗶𝗹𝗲\n▬▬▬▬▬▬▬▬▬▬▬▬\n🗃 𝑭𝒊𝒍𝒆: ${fileName}`,
              loadingMessage.messageID
            );
            return;
          }

          api.editMessage(
            `✅ 𝗙𝗶𝗹𝗲 𝗗𝗲𝗹𝗲𝘁𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!\n▬▬▬▬▬▬▬▬▬▬▬▬\n🗃 𝑹𝒆𝒎𝒐𝒗𝒆𝒅: ${fileName}`,
            loadingMessage.messageID
          );
        });

        break;
      case "edit":
        if (!fileName || !newContent)
          return api.sendMessage("⚠️ Usage: edit <file> <new content>", event.threadID);

        const editPath = path.join(__dirname, fileName);

        await sendLoading(`🔄 𝗘𝗱𝗶𝘁𝗶𝗻𝗴 𝗳𝗶𝗹𝗲\n📝 𝑭𝒊𝒍𝒆: ${fileName}`);

        fs.writeFile(editPath, newContent, (err) => {
          if (err) {
            api.editMessage(
              `❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗲𝗱𝗶𝘁 𝗳𝗶𝗹𝗲!\n▬▬▬▬▬▬▬▬▬▬▬▬\n🗃 𝑭𝒊𝒍𝒆: ${fileName}`,
              loadingMessage.messageID
            );
            return;
          }

          api.editMessage(
            `✅ 𝗙𝗶𝗹𝗲 𝗘𝗱𝗶𝘁𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!\n▬▬▬▬▬▬▬▬▬▬▬▬\n🗃 Updated: ${fileName}`,
            loadingMessage.messageID
          );
        });

        break;
      case "list":
        await sendLoading("📁 Fetching file list...");

        fs.readdir(__dirname, (err, files) => {
          if (err) {
            api.editMessage(`❌ Failed to read directory!`, loadingMessage.messageID);
            return;
          }

          const fileList = files.map(f => `📄 ${f}`).join("\n");

          api.editMessage(
            `📂 𝗙𝗶𝗹𝗲𝘀 𝗶𝗻𝘀𝗶𝗱𝗲 𝗱𝗶𝗿𝗲𝗰𝘁𝗼𝗿𝘆:\n▬▬▬▬▬▬▬▬▬▬▬▬\n${fileList}`,
            loadingMessage.messageID
          );
        });

        break;
      default:
        api.sendMessage("⚠️ Invalid action.\n📌Use: delete | edit | list", event.threadID);
    }
  }
};
