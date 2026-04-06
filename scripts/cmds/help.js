const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ Kyle's Bot ]";

module.exports = {
    config: {
        name: "help",
        version: "2.7",
        author: "NTKhang - Kyle",
        countDown: 5,
        role: 0,
        description: {
            en: "View command usage and category list"
        },
        guide: {
            en: "{pn} [empty | <command name>]"
                + "\n   {pn} setmedia: set a media for help (reply to an image/gif/video)"
                + "\n   {pn} setmediaremove: remove the current help media"
                + "\n   {pn} <command name> [-u | usage | -g | guide]: show only the usage guide"
                + "\n   {pn} <command name> [-i | info]: show only command information"
                + "\n   {pn} <command name> [-r | role]: show only command permissions"
                + "\n   {pn} <command name> [-a | alias]: show only command aliases"
        },
        priority: 1
    },

    langs: {
        en: {
            helpList: "\n%1\n➢ 𝗧𝗼𝘁𝗮𝗹: %2 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀\n➢ 𝗨𝘀𝗲 %3𝗵𝗲𝗹𝗽 <𝗰𝗺𝗱> 𝗳𝗼𝗿 𝗱𝗲𝘁𝗮𝗶𝗹𝘀\n➢ 𝗧𝘆𝗽𝗲 %3setmedia - set a media for help (reply to an image/gif/video)\n➢ 𝗧𝘆𝗽𝗲 %3setmediaremove - remove the current help media",
            commandNotFound: "The command \"%1\" does not exist",
            getInfoCommand: "╭─ 〔𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢〕 ─╮"
                + "\n│ 📝 𝗡𝗮𝗺𝗲: %1"
                + "\n│ 📜 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: %2"
                + "\n│ 🛠 𝗔𝗹𝗶𝗮𝘀: %3"
                + "\n│ 🔰 𝗚𝗿𝗼𝘂𝗽 𝗮𝗹𝗶𝗮𝘀: %4"
                + "\n│ 🧿 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: %5"
                + "\n│ 🔐 𝗥𝗼𝗹𝗲: %6"
                + "\n│ 🌡 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: %7s"
                + "\n│ 👤 𝗔𝘂𝘁𝗵𝗼𝗿: Kyle󱢏"
                + "\n├─ 📊 𝗨𝗦𝗔𝗚𝗘 ─┤"
                + "\n│%9"
                + "\n├─ 📌 𝗡𝗢𝗧𝗘𝗦 ─┤"
                + "\n│ <XXXXX> can be modified"
                + "\n│ [a|b|c] means a or b or c"
                + "\n╰─────────────╯"
        }
    },

    onStart: async function ({ message, args, event, threadsData, getLang, role, globalData, api }) {
        const { threadID, messageID } = event;
        const prefix = getPrefix(threadID);
        const mediaExtensions = ['.gif', '.jpg', '.jpeg', '.png', '.mp4'];

        // ———————————————— SET MEDIA ATTACHMENT ——————————————— //
        if (args[0]?.toLowerCase() === "setmedia") {
            if (event.messageReply?.attachments?.length > 0) {
                const attachment = event.messageReply.attachments[0];
                if (attachment.type === "photo" || attachment.type === "video" || attachment.type === "animated_image") {
                    try {
                        const ext = attachment.type === "photo" ? "jpg" : attachment.type === "video" ? "mp4" : "gif";
                        const helpMediaPath = path.normalize(`${process.cwd()}/assets/help_media.${ext}`);
                        const assetsDir = path.dirname(helpMediaPath);
                        if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

                        const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                        fs.writeFileSync(helpMediaPath, Buffer.from(response.data));
                        return message.reply("✅ Media for the help command set successfully!");
                    } catch (error) {
                        return message.reply("❌ Error: " + error.message);
                    }
                }
            }
            return message.reply("❌ Please reply to an image, GIF, or video.");
        }

        // ———————————————— REMOVE MEDIA ATTACHMENT ——————————————— //
        if (args[0]?.toLowerCase() === "setmediaremove") {
            let deleted = false;
            for (const ext of mediaExtensions) {
                const testPath = path.normalize(`${process.cwd()}/assets/help_media${ext}`);
                if (fs.existsSync(testPath)) {
                    fs.unlinkSync(testPath);
                    deleted = true;
                }
            }
            return message.reply(deleted ? "✅ Successfully removed help media." : "❌ No help media found to remove.");
        }

        const langCode = await threadsData.get(threadID, "data.lang") || global.GoatBot.config.language;
        const commandName = (args[0] || "").toLowerCase();
        let command = commands.get(commandName) || commands.get(aliases.get(commandName));

        // Loading Effect
        const loadingMsg = await message.reply("🔍 𝗟𝗼𝗮𝗱𝗶𝗻𝗴 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀...");

        if (!command && !args[0]) {
            const categoryMapping = {
                "ai": "ai", 
                "image": "image", "photo": "image", "edit": "image",
                "media": "media", "audio": "media", "music": "media", "download": "media",
                "video": "videos", "videos": "videos",
                "system": "systems", "info": "systems", "bot": "systems", "economy": "systems",
                "admin": "admin", "group": "admin", "moderation": "admin"
            };

            const categoryConfig = {
                "ai": { title: "🤖 𝗔𝗜 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦", desc: "Artificial Intelligence assistants" },
                "admin": { title: "🛡️ 𝗔𝗗𝗠𝗜𝗡𝗜𝗦𝗧𝗥𝗔𝗧𝗜𝗢𝗡", desc: "Group management and security" }, 
                "image": { title: "🖼️ 𝗜𝗠𝗔𝗚𝗘 𝗘𝗗𝗜𝗧𝗦", desc: "Photo and image processing" },
                "media": { title: "💿 𝗠𝗘𝗗𝗜𝗔 𝗧𝗢𝗢𝗟𝗦", desc: "Audio and download utilities" },
                "videos": { title: "🎬 𝗩𝗜𝗗𝗘𝗢 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦", desc: "Video processing and playback" },
                "systems": { title: "⚙️ 𝗦𝗬𝗦𝗧𝗘𝗠𝗦", desc: "Bot info and system settings" }
            };

            const categorizedCommands = {};
            let totalCommands = 0;

            for (const [name, cmdData] of commands) {
                if (cmdData.config.role > 1 && role < cmdData.config.role) continue;
                totalCommands++;
                const originalCategory = cmdData.config.category?.toLowerCase() || "systems";
                const mappedCategory = categoryMapping[originalCategory] || "systems";

                if (!categorizedCommands[mappedCategory]) categorizedCommands[mappedCategory] = [];
                categorizedCommands[mappedCategory].push(name);
            }

            let helpMessage = "";
            const orderedCategories = Object.keys(categoryConfig);

            orderedCategories.forEach((category) => {
                if (categorizedCommands[category]?.length > 0) {
                    const config = categoryConfig[category];
                    helpMessage += `\n${config.title}\n`;
                    helpMessage += ``;
                    
                    const cmds = categorizedCommands[category].sort();
                    for (let i = 0; i < cmds.length; i += 5) {
                        helpMessage += `${cmds.slice(i, i + 5).join(", ")}\n`;
                    }
                }
            });

            const finalMessage = getLang("helpList", helpMessage, totalCommands, prefix);
            const formSendMessage = { body: finalMessage };

            for (const ext of mediaExtensions) {
                const testPath = path.normalize(`${process.cwd()}/assets/help_media${ext}`);
                if (fs.existsSync(testPath)) {
                    formSendMessage.attachment = fs.createReadStream(testPath);
                    break;
                }
            }

            await api.editMessage(formSendMessage.body, loadingMsg.messageID);
            if (formSendMessage.attachment) {
                 message.reply(formSendMessage);
                 api.unsendMessage(loadingMsg.messageID);
            }
            return;
        }

        api.unsendMessage(loadingMsg.messageID);
        if (!command && args[0]) {
            return message.reply(getLang("commandNotFound", args[0]));
        }

        const threadData = await threadsData.get(threadID);
        const configCommand = command.config;
        let guide = configCommand.guide?.[langCode] || configCommand.guide?.["en"] || { body: "" };
        if (typeof guide == "string") guide = { body: guide };
        const guideBody = guide.body.replace(/\{pn\}/g, prefix + configCommand.name);

        const aliasesString = configCommand.aliases ? configCommand.aliases.join(", ") : "None";
        const roleOfCommand = threadData.data.setRole?.[configCommand.name] || configCommand.role;
        const roleText = roleOfCommand == 0 ? "Everyone" : roleOfCommand == 1 ? "Admin Only" : "Bot Owner";
        
        let description = checkLangObject(configCommand.description, langCode) || "No description available";

        const msgDetails = getLang("getInfoCommand", configCommand.name, description, aliasesString, "None", configCommand.version, roleText, configCommand.countDown || 1, configCommand.author || "", guideBody.split("\n").join("\n│"));
        
        return message.reply(msgDetails);
    }
};

function checkLangObject(data, langCode) {
    if (typeof data == "string") return data;
    if (typeof data == "object" && !Array.isArray(data)) return data[langCode] || data.en || undefined;
    return undefined;
              }
