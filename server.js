import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

const port = process.env.PORT || 3000;

// Spotifyトークン取得関数
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

// 感情に基づくおすすめ曲API
app.post("/recommend", async (req, res) => {
  const { mood } = req.body;
  const token = await getSpotifyToken();

  if (!token) {
    return res.status(500).json({ error: "Spotify token error" });
  }

  const moodQuery = {
    happy: "party",
    sad: "acoustic",
    energetic: "workout",
    relax: "chill"
  }[mood] || "pop";

  // offsetをランダム化（再提案ごとに違う曲になる）
  const offset = Math.floor(Math.random() * 30);

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${moodQuery}&type=track&limit=3&offset=${offset}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await response.json();
  res.json(data);
});

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
