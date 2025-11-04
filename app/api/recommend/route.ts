import { NextResponse } from "next/server";

const MOOD_KEYWORDS: Record<string, string[]> = {
  happy: ["うれしい", "楽しい", "嬉しい", "幸せ", "ワクワク"],
  sad: ["悲しい", "泣きたい", "つらい", "失恋", "寂しい"],
  energetic: ["元気", "最高", "やる気", "テンション"],
  relax: ["落ち着く", "まったり", "ゆっくり", "睡眠"],
};

// 感情推定
function analyzeMood(text: string) {
  for (const mood in MOOD_KEYWORDS) {
    if (MOOD_KEYWORDS[mood].some((w) => text.includes(w))) {
      return mood;
    }
  }
  return "neutral"; // fallback
}

// Spotify API用トークン取得
async function getSpotifyToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  return res.json();
}

// Spotify検索
async function searchTracks(mood: string, token: string) {
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${mood}&type=track&limit=3`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const json = await res.json();
  return json.tracks.items || [];
}

export async function POST(req: Request) {
  const { text } = await req.json();
  const mood = analyzeMood(text);

  const token = await getSpotifyToken();
  const tracks = await searchTracks(mood, token.access_token);

  return NextResponse.json({ mood, tracks });
}
