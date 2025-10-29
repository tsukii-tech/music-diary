import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import Sentiment from "sentiment"; // ← 感情分析用ライブラリ
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

const port = process.env.PORT || 3003
const sentiment = new Sentiment();

// --- Spotifyトークン取得 ---
async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

// --- 🧠 感情分析 → 音楽提案 ---
app.post("/recommend", async (req, res) => {
  const { content } = req.body;

  // Step 1: 感情スコアを取得
  const result = sentiment.analyze(content);
  const score = result.score;

  // Step 2: スコアに応じて「気分」を推定
  let mood;
  if (score > 2) mood = "happy";
  else if (score < -2) mood = "sad";
  else if (content.includes("疲") || content.includes("休")) mood = "relax";
  else mood = "energetic";

  console.log(`🧠 分析結果: ${score} → mood=${mood}`);

  // Step 3: Spotifyから取得
  const token = await getSpotifyToken();
  const moodQuery = {
    happy: "happy upbeat",
    sad: "sad acoustic",
    energetic: "workout",
    relax: "chill",
  }[mood] || "pop";

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${moodQuery}&type=track&limit=3`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await response.json();
  res.json({ mood, tracks: data.tracks.items });
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
