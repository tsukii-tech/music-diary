"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DiaryPage() {
  const searchParams = useSearchParams();
  const [text, setText] = useState("");
  const [tracks, setTracks] = useState<any[]>([]);
  const [mood, setMood] = useState("");
  const [selected, setSelected] = useState<string>(""); // ✅ どの曲を選んだか

  useEffect(() => {
    if (sessionStorage.getItem("sent")) return;
    sessionStorage.setItem("sent", "1");
    const t = searchParams.get("text") || "";
    setText(t);

    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: t,
        history: JSON.parse(localStorage.getItem("history") || "[]"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMood(data.mood);
        setTracks(data.tracks);

        const old = JSON.parse(localStorage.getItem("history") || "[]");
        const newer = [...old, ...data.tracks.map((t: any) => t.id)];
        localStorage.setItem("history", JSON.stringify(newer));
      });
  }, []);

  // ✅ 日記＋音楽セットで保存！
  const addFavorite = (track: any) => {
    if (selected) return; // すでに保存済みならブロック

    const content = localStorage.getItem("pendingDiaryContent") || "";
    const diaries = JSON.parse(localStorage.getItem("diaries") || "[]");

    diaries.push({
      date: new Date().toLocaleString("ja-JP", { hour12: false }),
      iso: new Date().toISOString(),
      content,
      music: {
        title: track.name,
        artist: track.artists[0].name,
        url: track.external_urls.spotify,
        image: track.album.images[0]?.url,
      },
    });

    localStorage.setItem("diaries", JSON.stringify(diaries));
    localStorage.removeItem("pendingDiaryContent");
    setSelected(track.id);

    alert("保存しました！");
  };

  return (
    <main style={{ padding: 20 }}>
      <h3>感情推定：{mood}</h3>
      <h3>おすすめ</h3>

      {tracks.map((t) => (
        <div key={t.id} className="track-item">
          {t?.album?.images?.[0]?.url && (
            <img
              src={t.album.images[0].url}
              width={120}
              height={120}
              style={{ borderRadius: 12, marginBottom: 8 }}
            />
          )}
          <p>{t.name} / {t.artists[0].name}</p>

          <button
            onClick={() => addFavorite(t)}
            className={selected ? "disabled" : ""}
          >
            お気に入りに追加
          </button>
        </div>
      ))}

      <a href="/diary/history">
        <button style={{ marginTop: 20 }}>これまでの日記を見る</button>
      </a>
    </main>
  );
}
