const fetch = require("node-fetch");
const os = require("os");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function fmt(n) { return `${Math.round(n)} ms`; }

async function rtt(url, timeoutMs = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(url, { method: "GET", signal: ctrl.signal });
    await res.arrayBuffer();
    return Date.now() - start;
  } finally {
    clearTimeout(t);
  }
}

function stats(arr) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  const jitter = arr.map(x => Math.abs(x - avg)).reduce((a, b) => a + b, 0) / arr.length;
  return { min, max, avg, jitter };
}

module.exports = {
  config: {
    name: "ping",
    version: "1.0.2",
    author: "NZR",
    role: 0,
    shortDescription: { en: "Live ping (3 updates + final summary)" },
    category: "tools",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, message }) {
    const endpoints = [
      "https://www.google.com/generate_204",
      "https://1.1.1.1/",
      "https://cloudflare.com/cdn-cgi/trace"
    ];

    const pings = [];
    let msg = await message.reply("⏱️ Measuring ping...");

    // 3 updates
    for (let i = 0; i < 3; i++) {
      const target = endpoints[i % endpoints.length];
      let ms;
      try { ms = await rtt(target); } catch { ms = NaN; }
      pings.push(Number.isFinite(ms) ? ms : 0);

      await api.editMessage(
        `🏓 Ping ${i + 1}/3\n` +
        `• Target: ${target}\n` +
        `• RTT: ${Number.isFinite(ms) ? fmt(ms) : "timeout"}\n` +
        `• Time: ${new Date().toLocaleTimeString()}`,
        msg.messageID
      );

      await sleep(3000);
    }

    // Final 4th update
    const { min, max, avg, jitter } = stats(pings.map(x => x || 0));
    const memTotal = os.totalmem();
    const memFree = os.freemem();
    const memUsed = memTotal - memFree;
    const toMB = b => (b / 1024 / 1024).toFixed(1) + " MB";
    const toPct = (a, b) => ((a / b) * 100).toFixed(1) + "%";
    const cpu = os.cpus()[0] || {};
    const load = os.loadavg();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "PH";

    await api.editMessage(
      `✅ Final Network Summary\n` +
      `• Min: ${fmt(min)}\n` +
      `• Max: ${fmt(max)}\n` +
      `• Avg: ${fmt(avg)}\n` +
      `• Jitter: ${fmt(jitter)}\n\n` +
      `🖥️ System\n` +
      `• OS: ${os.platform()} ${os.release()} (${os.arch()})\n` +
      `• CPU: ${cpu.model || "Unknown"} x${os.cpus().length}\n` +
      `• Load(1/5/15): ${load.map(n => n.toFixed(2)).join(" / ")}\n` +
      `• Uptime: ${(os.uptime()/3600).toFixed(2)} h\n` +
      `• Memory: ${toMB(memUsed)} / ${toMB(memTotal)} (${toPct(memUsed, memTotal)})\n` +
      `• Node: ${process.version}\n` +
      `• Timezone: ${tz}`,
      msg.messageID
    );
  }
};
