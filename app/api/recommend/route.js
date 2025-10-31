import { NextResponse } from "next/server";

export async function GET() {
  const songs = [
    { title: "Song1", artist: "Artist1" },
    { title: "Song2", artist: "Artist2" }
  ];

  return NextResponse.json({ songs });
}
