// app/api/recommend/route.ts
import { NextResponse } from "next/server";

// 🎭 感情ごとの検索候補
const moodQueries: Record<string, string[]> = {
  happy: ["楽しい J-POP", "ハッピー ポップ", "パーティー", "爽やか ポップ", "元気ソング"],
  sad: ["失恋 バラード", "切ない 歌", "悲しい 歌", "ゆっくり バラード", "感傷ソング"],
  angry: ["激しい ロック", "メタル", "激怒", "アグレッシブ", "ハードコア"],
  relaxed: ["チル ミュージック", "癒し BGM", "LoFi", "ゆったり", "コーヒータイム"],
  neutral: ["人気 ソング", "話題 曲", "急上昇 ミュージック", "ランキング", "おすすめ"]
};

// 🎭 感情推定
function detectMood(text: string): string {
  if (/悲|泣|寂|落ち込/.test(text)) return "sad";
  if (/嬉|楽|幸|最高|喜/.test(text)) return "happy";
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

// 🎧 Spotify検索（limit増 → 候補数UP）
async function searchSpotify(query: string, limit = 10) {
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
    const list = moodQueries[mood];

    // 🎲 感情キーワードをランダムに2つ抽出
    const picks = [...list].sort(() => Math.random() - 0.5).slice(0, 2);

    // 🧩キーワード抽出
    const keyword = extractKeyword(text);

    // 🎧 感情とキーワードから候補グループを取得
    const results = [
      ...(await searchSpotify(picks[0], 10)),
      ...(await searchSpotify(picks[1], 10)),
      ...(await searchSpotify(keyword, 10))
    ];

    // ✅ 重複排除
    const unique = Array.from(
      new Map(results.map((t) => [t.id, t])).values()
    );

    // 🔀 シャッフル
    const shuffled = unique.sort(() => Math.random() - 0.5);

    // 🎯 最終的に3曲返す
    const tracks = shuffled.slice(0, 3);

    return NextResponse.json({
      mood,
      keyword,
      tracks,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
