const axios = require("axios");

/**
 * 🔴 ROOT FIX
 * GoatBot V2 DOES NOT auto-create handleReply
 */
if (!global.client.handleReply) {
  global.client.handleReply = [];
}

module.exports = {
  config: {
    name: "spotify",
    version: "1.1.0",
    author: "April Manalo (auto-download fix by Grok)",
    role: 0,
    category: "music",
    guide: "-spotify <song name>"
  },

  // ==========================
  // START COMMAND - AUTO DOWNLOAD FIRST RESULT
  // ==========================
  onStart: async function ({ api, event, args }) {
    try {
      const { threadID } = event;
      const query = args.join(" ").trim();

      if (!query) {
        return api.sendMessage(
          "⚠️ Usage: -spotify <song name>\nExample: -spotify perfect ed sheeran",
          threadID
        );
      }

      await api.sendMessage("🔎 Searching Spotify for the best match...", threadID);

      // Search Spotify
      const searchRes = await axios.get(
        "https://norch-project.gleeze.com/api/spotify",
        { params: { q: query } }
      );

      const songs = searchRes.data?.results;

      if (!songs || songs.length === 0) {
        return api.sendMessage("❌ No results found for your query.", threadID);
      }

      // Awtomatikong kunin ang PINAKAUNANG result
      const song = songs[0];

      await api.sendMessage(
        `✅ Found & Downloading:\n🎵 ${song.title}\n👤 ${song.artist}\n⏱ ${song.duration}`,
        threadID
      );

      if (!song.spotify_url) {
        return api.sendMessage("❌ Error: Spotify URL not found.", threadID);
      }

      // Download ang track
      const dlRes = await axios.get(
        "https://norch-project.gleeze.com/api/spotify-dl-v2",
        { params: { url: song.spotify_url } }
      );

      const track = dlRes.data?.trackData?.[0];

      if (!track || !track.download_url) {
        return api.sendMessage("❌ Failed to get download link.", threadID);
      }

      // Send cover image + title
      if (track.image) {
        await api.sendMessage(
          {
            body: `🎧 ${track.name}\n👤 ${track.artists}\n\nEnjoy your music! 🎶`,
            attachment: await global.utils.getStreamFromURL(track.image)
          },
          threadID
        );
      }

      // Send ang MP3 file
      await api.sendMessage(
        {
          body: "📁 Here's your audio file:",
          attachment: await global.utils.getStreamFromURL(track.download_url)
        },
        threadID
      );

      await api.sendMessage("✅ Download complete! 🎉", threadID);

    } catch (err) {
      console.error("[SPOTIFY ERROR]", err);
      api.sendMessage("❌ Something went wrong while downloading. Try again later.", event.threadID);
    }
  }
};
