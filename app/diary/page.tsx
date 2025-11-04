"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DiaryPage() {
  const searchParams = useSearchParams();
  const [text, setText] = useState("");
  const [tracks, setTracks] = useState<any[]>([]);
  const [mood, setMood] = useState("");

  useEffect(() => {
    const t = searchParams.get("text") || "";
    setText(t);

    // APIへ送信
    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: t }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMood(data.mood);
        setTracks(data.tracks);
      });
  }, []);

  // お気に入り追加
  const addFavorite = (track: any) => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    favs.push(track);
    localStorage.setItem("favorites", JSON.stringify(favs));
    alert("お気に入りに追加しました！");
  };

  return (
    <main style={{ padding: 20 }}>
      <h2>あなたの日記</h2>
      <p>{text}</p>

      <h3>感情推定：{mood}</h3>
      <h3>おすすめの音楽 🎶</h3>

      {tracks.map((t) => (
        <div key={t.id} className="track-item">
          <p>{t.name} / {t.artists[0].name}</p>
          <a href={t.external_urls.spotify} target="_blank">Spotifyで聴く</a>
          <br/>
          <button onClick={() => addFavorite(t)}>お気に入りに追加</button>
        </div>
      ))}

      <a href="/diary/history">
        <button style={{ marginTop: 20 }}>これまでの日記を見る</button>
      </a>

    </main>
  );
}
