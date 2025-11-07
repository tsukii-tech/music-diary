"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";


export default function DiaryPage() {
  const searchParams = useSearchParams();
  const [text, setText] = useState("");
  const [tracks, setTracks] = useState<any[]>([]);
  const [mood, setMood] = useState("");

  // ① URLの ?text=... を反映
  useEffect(() => {
    const t = searchParams.get("text") || "";
    setText(t);
  }, [searchParams]);

  // ② 取得した text を localStorage に追記して保存
  useEffect(() => {
    if (!text) return;
    const list = JSON.parse(localStorage.getItem("diaries") || "[]");
    list.push({
      id: (crypto?.randomUUID && crypto.randomUUID()) || Date.now(),
      date: new Date().toLocaleString("ja-JP", { hour12: false }),
      mood: null,
      content: text,
    });
    localStorage.setItem("diaries", JSON.stringify(list));
  }, [text]);

  // ③ レコメンド取得
  useEffect(() => {
    if (!text) return;
    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },


  // お気に入り追加
  const addFavorite = (track: any) => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    favs.push(track);
    localStorage.setItem("favorites", JSON.stringify(favs));
    alert("お気に入りに追加しました！");
  };

  return (
    <main style={{ padding: 20 }}>
      
      <h3><b>今日のあなたへ</b></h3>

      {tracks.length === 0 && <p>おすすめの曲がまだありません。</p>}

      {tracks.map((t, i) => {
        const title = t?.name ?? "Unknown title";
        const artist = t?.artists?.[0]?.name ?? "Unknown artist";
        const imageUrl = t?.album?.images?.[0]?.url;
        const spotifyUrl = t?.external_urls?.spotify;


      <a href="/diary/history">
        <button style={{ marginTop: 20 }}>これまでの日記を見る</button>
      </a>

    </main>
  );
}

