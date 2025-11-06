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
      body: JSON.stringify({ 
        text: t,
        history: JSON.parse(localStorage.getItem("history") || "[]"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMood(data.mood);
        setTracks(data.tracks);

         // ✅ history更新
        const old = JSON.parse(localStorage.getItem("history") || "[]");
        const newer = [...old, ...data.tracks.map((t: any) => t.id)];
        localStorage.setItem("history", JSON.stringify(newer));
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
      

      <h3>感情推定：{mood}</h3>
      <h3>おすすめ</h3>

      {tracks.map((t) => (
        <div key={t.id} className="track-item">
          {t?.album?.images?.[0]?.url && (
                <div className="arubamu">
                  <img 
                      src={t.album.images[0].url}
                      alt={`${t.name} のアルバム画像`}
                      width={120}
                      height={120}
                      style={{ borderRadius: 12, display: "block", marginBottom: 8 }}
                    />
                </div>
          
          )}
          <p>{t.name} / {t.artists[0].name}</p>
          {/*<a href={t.external_urls.spotify} target="_blank"rel="noopener noreferrer">Spotifyで聴く</a>
          <br/>*/}
          <a href={t.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            Spotifyで聴く
          </a>
          <br/>

          {/* ✅ 30秒プレビュー（あれば表示） */}
          {t.preview_url ? (
            <audio
              src={t.preview_url}
              controls
              preload="none"
              data-audio
              onPlay={(e) => {
                // このページ内で同時再生しないように、他のaudioを停止
                document.querySelectorAll('audio[data-audio]').forEach((el) => {
                  if (el !== e.currentTarget) (el as HTMLAudioElement).pause();
                });
              }}
              style={{ marginTop: 6 }}
            />
          ) : (
            <small style={{ display: "inline-block", marginTop: 6, opacity: 0.7 }}>
              プレビュー音源なし
            </small>
          )}
          <button onClick={() => addFavorite(t)}>お気に入りに追加</button>
        </div>
      ))}

      <a href="/diary/history">
        <button style={{ marginTop: 20 }}>これまでの日記を見る</button>
      </a>


    </main>
  );
}

