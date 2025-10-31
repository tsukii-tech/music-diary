import { NextResponse } from "next/server";

export async function POST(request) {
  const { text } = await request.json();

  // 仮の分析ロジック
  const mood = text.includes("楽しい") ? "happy" : "neutral";

  return NextResponse.json({
    mood,
    keywords: ["音楽", "気分"],
    recommended_genre: "Pop"
  });
}
