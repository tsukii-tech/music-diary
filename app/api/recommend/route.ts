import { NextResponse } from "next/server";

// 🎭 感情ごとの検索候補
const moodQueries: Record<string, string[]> = {
  happy: ["楽しい J-POP", "ハッピー ポップ", "パーティー"],
  sad: ["失恋 バラード", "切ない 歌", "悲しい 歌"],
  angry: ["激しい ロック", "メタル", "激怒"],
  relaxed: ["チル ミュージック", "癒し BGM", "LoFi"],
  neutral: ["人気 ソング", "話題 曲", "急上昇 ミュージック"],
};

// 🎭 感情推定
function detectMood(text: string): string {
  if (/悲|泣|寂|落ち込/.test(text)) return "sad";
  if (/嬉|楽|幸|最高/.test(text)) return "happy";
  if (/怒|ムカ|腹/.test(text)) return "angry";
  if (/癒|落ち着|穏/.test(text)) return "relaxed";
  return "neutral";
}

// 🧩キーワード抽出
function extractKeyword(text: string): string {
  const words = text
    .replace(/[。、,.!?！？]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  return words[0] || "人気";
}

// 🔑 Spotifyアクセストークン取得
async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

// 🎧 Spotify検索
async function searchSpotify(query: string, limit = 1) {
  const token = await getAccessToken();

  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
    query
  )}&type=track&market=JP&limit=${limit}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  return data.tracks?.items || [];
}

// 🎉 APIエンドポイント本体
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body.text || "";

    // 感情判定
    const mood = detectMood(text);

    // キーワード抽出
    const keyword = extractKeyword(text);

    const list = moodQueries[mood];

    // 🎧感情おすすめ 2曲
    const tracks1 = await searchSpotify(list[0], 1);
    const tracks2 = await searchSpotify(list[1], 1);

    // 🧩キーワードおすすめ 1曲
    const tracksKeyword = await searchSpotify(keyword, 1);

    // 結合（3曲）
    const tracks = [...tracks1, ...tracks2, ...tracksKeyword];

    return NextResponse.json({
      mood,
      tracks,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
