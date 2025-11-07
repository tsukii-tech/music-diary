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
      body: JSON.stringify({ text }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMood(data?.mood ?? "");
        setTracks(Array.isArray(data?.tracks) ? data.tracks : []);
      })
      .catch(() => setTracks([]));
  }, [text]);

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

        return (
          <div key={t?.id ?? t?.uri ?? i} className="track-item" style={{ marginBottom: 16 }}>
            {imageUrl && (
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 8,
                  textDecoration: "none",
                }}
              >
                <img
                  src={imageUrl}
                  alt={`${title} のアルバム画像`}
                  width={100}
                  height={100}
                  style={{
                    borderRadius: 12,
                    display: "block",
                    transition: "transform 0.2s ease",
                   
                  }}
                />
              </a>
            )}

            <p style={{ textAlign: "center", margin: "4px 0 8px", fontWeight: 600 }}>
              {title} / {artist}
            </p>

            
            <br />

            <button onClick={() => addFavorite(t)}>お気に入りに追加</button>
          </div>
        );
      })}

      <a href="/diary/history">
        <button style={{ marginTop: 20 }}>これまでの日記を見る</button>
      </a>

    </main>
  );
}
