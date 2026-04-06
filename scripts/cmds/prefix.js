const fs = require("fs-extra");
const moment = require("moment-timezone");
const path = require("path"); // added missing import
const axios = require("axios"); // added missing import


const kylefacts = [
    "Octopuses have three hearts: two pump blood to the gills, and one pumps it to the rest of the body.",
    "Honey never spoils; archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old.",
    "The world's oldest known recipe is for beer.",
    "Bananas are berries, but strawberries are not.",
    "Cows have best friends and can become stressed when they are separated.",
    "The shortest war in history was between Britain and Zanzibar on August 27, 1896; Zanzibar surrendered after 38 minutes.",
    "The average person walks the equivalent of three times around the world in a lifetime.",
    "Polar bears are left-handed.",
    "The unicorn is Scotland's national animal.",
    "A group of flamingos is called a 'flamboyance'.",
    "There are more possible iterations of a game of chess than there are atoms in the known universe.",
    "The smell of freshly-cut grass is actually a plant distress call.",
    "A day on Venus is longer than its year.",
    "Honeybees can recognize human faces.",
    "Wombat poop is cube-shaped.",
    "The first oranges weren't orange.",
    "The longest time between two twins being born is 87 days.",
    "A bolt of lightning is six times hotter than the sun.",
    "A baby puffin is called a puffling.",
    "A jiffy is an actual unit of time: 1/100th of a second.",
    "The word 'nerd' was first coined by Dr. Seuss in 'If I Ran the Zoo'.",
    "There's a species of jellyfish that is biologically immortal.",
    "The Eiffel Tower can be 6 inches taller during the summer due to the expansion of the iron.",
    "The Earth is not a perfect sphere; it's slightly flattened at the poles and bulging at the equator.",
    "A hummingbird weighs less than a penny.",
    "Koalas have fingerprints that are nearly identical to humans'.",
    "There's a town in Norway where the sun doesn't rise for several weeks in the winter, and it doesn't set for several weeks in the summer.",
    "A group of owls is called a parliament.",
    "The fingerprints of a koala are so indistinguishable from humans' that they have on occasion been confused at a crime scene.",
    "The Hawaiian alphabet has only 13 letters.",
    "The average person spends six months of their life waiting for red lights to turn green.",
    "A newborn kangaroo is about 1 inch long.",
    "The oldest known living tree is over 5,000 years old.",
    "Coca-Cola would be green if coloring wasn't added to it.",
    "A day on Mars is about 24.6 hours long.",
    "The Great Wall of China is not visible from space without aid.",
    "A group of crows is called a murder.",
    "There's a place in France where you can witness an optical illusion that makes you appear to grow and shrink as you walk down a hill.",
    "The world's largest desert is Antarctica, not the Sahara.",
    "A blue whale's heart is so big that a human could swim through its arteries.",
    "The longest word in the English language without a vowel is 'rhythms'.",
    "Polar bears' fur is not white; it's actually transparent.",
    "The electric chair was invented by a dentist.",
    "An ostrich's eye is bigger than its brain.",
    "Wombat poop is cube-shaped.",
    "Even a small amount of alcohol poured on a scorpion will drive it crazy and sting itself to death.",
    "The crocodile can't stick its tongue out.",
    "The oldest known animal in the world is a 405-year-old male, discovered in 2007.",
    "Sharks, like other fish, have their reproductive organs located in the ribcage.",
    "The eyes of the octopus have no blind spots. On average, the brain of an octopus has 300 million neurons. When under extreme stress, some octopuses even eat their trunks.",
    "An elephant's brain weighs about 6,000g, while a cat's brain weighs only approximately 30g.",
    "Cats and dogs have the ability to hear ultrasound.",
    "Sheep can survive up to 2 weeks in a state of being buried in snow.",
    "The smartest pig in the world is owned by a math teacher in Madison, Wisconsin (USA). It has the ability to memorize worksheets multiplying to 12.",
    "Statistics show that each rattlesnake's mating lasts up to ... more than 22 hours",
    "Studies have found that flies are deaf.",
    "In a lack of water, kangaroos can endure longer than camels.",
    "Dogs have 4 toes on their hind legs and 5 toes on each of their front paws.",
    "The average flight speed of honey bees is 24km/h. They never sleep.",
    "Cockroaches can live up to 9 days after having their heads cut off.",
    "If you leave a goldfish in the dark for a long time, it will eventually turn white.",
    "The flying record for a chicken is 13 seconds.",
    "The mosquito that causes the most deaths to humans worldwide is the mosquito.",
    "The quack of a duck doesn't resonate, and no one knows why."
];


const mediaExtensions = [".jpg", ".mp4", ".gif"]; // defined mediaExtensions

module.exports = {
    config: {
        name: "prefix",
        version: "3.0",
        author: "Kyle",
        countDown: 5,
        role: 0,
        description: "Change bot prefix or view prefix info.",
        category: "system",
        guide: {
            en:
                "🔹 {pn} <newPrefix>\n" +
                " Set new prefix for this chat\n\n" +
                "🔹 {pn} <newPrefix> -g\n" +
                " Set new GLOBAL prefix (admin only)\n\n" +
                "🔹 {pn} reset\n" +
                " Reset prefix to default\n\n" +
                "🔹 prefix\n" +
                " Show prefix info\n\n" +
                "🔹 _cmd\n" +
                " Show bot uptime & status",
        },
    },

    langs: {
        en: {
            reset: "🔄 Reset to default prefix: %1",
            onlyAdmin: "⛔ Only bot admins can change GLOBAL prefix!",
            confirmGlobal: "📌 React to confirm GLOBAL prefix update.",
            confirmThisThread: "📌 React to confirm prefix update for this chat.",
            successGlobal: "✅ 𝗣𝗥𝗘𝗙𝗜𝗫 𝗨𝗣𝗗𝗔𝗧𝗘𝗗.\n\n• Global prefix updated: %1",
            successThisThread: "✅ Chat prefix updated: %1",
        },
    },

    onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
        if (!args ||!args[0]) return message.SyntaxError();

        // RESET
        if (args[0] === "reset") {
            await threadsData.set(event.threadID, null, "data.prefix");
            return message.reply(getLang("reset", global.GoatBot.config.prefix));
        }
        // ———————————————— SET MEDIA ATTACHMENT ——————————————— //
        if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
            const attachment = event.messageReply.attachments[0];
            if (attachment.type === "photo" || attachment.type === "video" || attachment.type === "animated_image") {
                try {
                    const ext = attachment.type === "photo"? "jpg" : attachment.type === "video"? "mp4" : "gif";
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

        // ———————————————— REMOVE MEDIA ATTACHMENT ——————————————— //
        if (event.body && event.body.toLowerCase() === "setmediaremove") {
            let deleted = false;
            for (const ext of mediaExtensions) {
                const testPath = path.normalize(`${process.cwd()}/assets/help_media${ext}`);
                if (fs.existsSync(testPath)) {
                    fs.unlinkSync(testPath);
                    deleted = true;
                }
            }
            return message.reply(deleted? "✅ Successfully removed help media." : "❌ No help media found to remove.");
        }

        const newPrefix = args[0];
        const isGlobal = args[1] === "-g";

        if (isGlobal && role < 2) return message.reply(getLang("onlyAdmin"));

        const formSet = {
            commandName,
            author: event.senderID,
            newPrefix,
            setGlobal: isGlobal,
        };

        return message.reply(
            isGlobal? getLang("confirmGlobal") : getLang("confirmThisThread"),
            (err, info) => {
                if (!err) {
                    formSet.messageID = info.messageID;
                    global.GoatBot.onReaction.set(info.messageID, formSet);
                }
            }
        );
    },

    onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
        if (event.userID!== Reaction.author) return;

        const { newPrefix, setGlobal } = Reaction;
        if (setGlobal) {
            global.GoatBot.config.prefix = newPrefix;
            fs.writeFileSync(
                global.client.dirConfig,
                JSON.stringify(global.GoatBot.config, null, 2)
            );
            return message.reply(getLang("successGlobal", newPrefix));
        }

        await threadsData.set(event.threadID, newPrefix, "data.prefix");
        return message.reply(getLang("successThisThread", newPrefix));
    },

    onChat: async function ({ event, message, threadsData, usersData }) {
        if (!event.body) return;

        const body = event.body.toLowerCase();
        if (!body) return;

        const randomFact = kylefacts[Math.floor(Math.random() * kylefacts.length)];
        const globalPrefix = global.GoatBot.config.prefix;
        const threadPrefix = await threadsData.get(event.threadID, "data.prefix") || globalPrefix;

        // TIME (PH)
        const ph = moment().tz("Asia/Manila");
        const time = ph.format("hh:mm A");
        const date = ph.format("MMMM D, YYYY");
        const day = ph.format("dddd");

        // UPTIME
        const ms = process.uptime() * 1000;
        const uptime = {
            d: Math.floor(ms / (1000 * 60 * 60 * 24)),
            h: Math.floor(ms / (1000 * 60 * 60)) % 24,
            m: Math.floor(ms / (1000 * 60)) % 60,
            s: Math.floor(ms / 1000) % 60,
        };

        // PREFIX INFO
        if (body === "prefix" || body === "p") {
            const name = await usersData.getName(event.senderID);

            return message.reply(
                `👋 Hey ${name}, Here's my prefix:\n` +

                ` ╭─────◉\n` +
                ` │ 𝙋𝙍𝙀𝙁𝙄𝙓 𝙄𝙉𝙵𝙊:\n` +
                ` │🌐 Global Prefix: ${globalPrefix}\n` +
                ` │💬 Chat Prefix: ${threadPrefix}\n` +
                ` │\n` +
                ` │👑 Owner: Kyle〠\n` +
                ` │🔗 Facebook: https://www.facebook.com/kyletheintrovert\n` +
                ` ╰───────────⬤\n` +
                ` ╭──────────◉\n` +
                ` │⚡𝗨𝗣𝗧𝗜𝗠𝗘 :\n` +
                ` │🗓 - ${uptime.d}d\n` +
                ` │⏳ - ${uptime.h}h\n` +
                ` │⏰ - ${uptime.m}m\n` +
                ` │⏱️ - ${uptime.s}s\n` +
                ` │\n` +
                ` │📅 𝗗𝗮𝘁𝗲 𝗮𝗻𝗱 𝘁𝗶𝗺𝗲:\n ` +
                `│📆 ${date}\n` +
                ` │⏰${time}\n` +
                ` │🗓${day}\n` +
                ` │\n` +
                ` │📌 𝗙𝗮𝗰𝘁: ${randomFact}\n` +
                ` │\n` +
                ` │\n` +
                ` │✨ 𝗧𝘆𝗽𝗲: ${threadPrefix}help - to see my all available commands\n` +
                ` ╰───────────✪`
            );
        }
    },
};
