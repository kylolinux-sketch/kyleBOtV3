const { GoatWrapper } = require('fca-liane-utils');
const fs = require("fs-extra");
const axios = require("axios");
const moment = require("moment-timezone");
const os = require('os');
const util = require('util');
const manilaTime = moment.tz('Asia/Manila');

const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];


module.exports = {
  config: {
    name: "owner",
    aliases: ["ownr", "info","boss"],
    version: "1.8",
    author: "Kylepogi",
    countDown: 5,
    role: 0,
    description: { en: "Bot uptime monitor" },
    category: "owner",
    guide: { en: "{pn}uptime to show bot uptime info" }
  },

  onStart: async function ({ message, api }) {
    const uptime = process.uptime();
    const formattedUptime = formatMilliseconds(uptime * 1000);
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const diskUsage = await getDiskUsage();
    const formattedDateTime = manilaTime.format('MMMM D, YYYY h:mm A');
    
    const systemInfo = {
      os: `${os.type()} ${os.release()}`,
      arch: os.arch(),
      cpu: `${os.cpus()[0].model} (${os.cpus().length} cores)`,
      loadAvg: os.loadavg()[0],
      botUptime: formattedUptime,
      systemUptime: formatUptime(os.uptime()),
      processMemory: prettyBytes(process.memoryUsage().rss),
      platform: os.platform(),
      hostname: os.hostname(),
      release: os.release()
    };

    // Measure bot response time
    const start = Date.now();
    await axios.get('https://google.com'); // Simulate network request
    const BotPing = Date.now() - start;

    const loadingMessage = await message.reply(`[𓃵] 𝗞𝘆𝗹𝗲'𝘀 𝗕𝗼𝘁 𝗼𝘄𝗻𝗲𝗿:\n\n${spinner[0]} Checking Owner info...`);
    let currentFrame = 0;
    const intervalId = setInterval(async () => {
      currentFrame = (currentFrame + 1) % spinner.length;
      await api.editMessage(`[𓃵] 𝗞𝘆𝗹𝗲'𝘀 𝗕𝗼𝘁 𝗼𝘄𝗻𝗲𝗿:\n\n${spinner[currentFrame]}Checking owner info ...`, loadingMessage.messageID);
    }, 200);

    await new Promise(resolve => setTimeout(resolve, 30000)); // Simulated async delay
    clearInterval(intervalId);

    return message.reply({
      body: `➣ 📜 | 𝗢𝘄𝗻𝗲𝗿 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 ❏
╭─────────────❏    
│ ◌𝙽𝚊𝚖𝚎: 𝙺𝚢𝚕𝚎 𝙱𝚊𝚒𝚝-𝚒𝚝
│ ◌𝙽𝚒𝚌𝚔: 𝚔𝚢𝚕𝚘/
│ ◌𝙰𝚐𝚎: 21
│ ◌𝙶𝙴𝙽𝙳𝙴𝚁: 𝚖𝚊𝚕𝚎,𝚕𝚊𝚕𝚊𝚔𝚒, 𝚑𝚎, 𝚑𝚒𝚖. 
│ ◌𝚃𝚊𝚕𝚎𝚗𝚝: 𝚖𝚊𝚐 𝚕𝚞𝟸, 𝚙𝚊𝚐𝚒𝚐𝚒𝚗𝚐 𝚝𝚊𝚖𝚊𝚍
│ ◌𝚂𝚙𝚘𝚛𝚝𝚜: 𝚃𝚊𝚎𝚔𝚠𝚘𝚗𝚍𝚘,𝙲𝚘𝚖𝚋𝚊𝚝 𝚃𝚊𝚎𝚔𝚠𝚘𝚗𝚍𝚘,𝙺𝚊𝚛𝚊𝚝𝚎,𝙱𝚘𝚡𝚒𝚗𝚐,𝙺𝚒𝚌𝚔 𝙱𝚘𝚡𝚒𝚗𝚐,𝚂𝚘𝚌𝚌𝚎𝚛,𝚂𝚎𝚙𝚊𝚔 𝚃𝚊𝚔𝚛𝚊𝚠, 𝟿𝟿𝚘𝚝𝚑𝚎𝚛𝚜 𝚒𝚝 𝚍𝚎𝚙𝚎𝚗𝚍𝚜 𝚘𝚏 𝚖𝚢 𝚜𝚙𝚘𝚛𝚝𝚜 𝚑𝚞𝚖𝚘𝚛. 
│ ◌𝙷𝙾𝙱𝙱𝚈: 𝗉𝗅𝖺𝗒𝗂𝗇𝗀 𝗀𝖺𝗆𝖾𝗌, 𝚖𝚞𝚜𝚒𝚌, 𝙵𝚞𝚗𝚔 & 𝚙𝚑𝚘𝚗𝚔 𝚕𝚘𝚟𝚎𝚛, 𝙱𝚊𝚗𝚐𝚎𝚛𝚜 𝚕𝚘𝚟𝚎𝚛 𝚊𝚗𝚍 𝚕𝚒𝚛𝚒𝚔 𝚖𝚊𝚔𝚎𝚛 𝚕𝚘𝚟𝚎𝚛
│ ◌𝚂𝚃𝙰𝚃𝚄𝚂: 𝚜𝚘𝚛𝚛𝚢, 𝙸 𝚑𝚊𝚟𝚎 𝚖𝚢 𝚘𝚠𝚗 𝚐𝚒𝚛𝚕. 
│ ◌𝙵𝙱-𝙻𝙸𝙽𝙺: 
│ ◌𝙱𝙸𝙾: 𝙻𝚘𝚟𝚎 𝚑𝚎𝚛. 
╰────────────────◉
█▄▀ █▄█ █░ █▀▀
█░█ ░█░ █▄ ██▄ `
    });
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });

function formatMilliseconds(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

async function getDiskUsage() {
  return 'N/A'; // Disk usage function placeholder
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}
function prettyBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
