"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DiaryPage() {
  const searchParams = useSearchParams();
  const [text, setText] = useState("");
  const [tracks, setTracks] = useState<any[]>([]);
  const [mood, setMood] = useState("");

  const [saved, setSaved] = useState(false);

  // ① URLの ?text=... を反映
  useEffect(() => {
    if (sessionStorage.getItem("sent")) return;
    sessionStorage.setItem("sent", "1");
    const t = searchParams.get("text") || "";
    setText(t);
  }, [searchParams]);

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

  // ③ レコメンド取得（両ブランチ統合版）
  useEffect(() => {
    if (!text) return;

    let aborted = false;
    (async () => {
      try {
        const history = JSON.parse(localStorage.getItem("history") || "[]");
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, history }),
        });
        const data = await res.json();
        if (aborted) return;

        setMood(data?.mood ?? "");
        const got = Array.isArray(data?.tracks) ? data.tracks : [];
        setTracks(got);

        // ✅ history更新
        const old = Array.isArray(history) ? history : [];
        const newer = [...old, ...got.map((t: any) => t.id).filter(Boolean)];
        localStorage.setItem("history", JSON.stringify(newer));
      } catch (e) {
        console.error(e);
        setTracks([]); // フォールバック
      }
    })();

    return () => {
      aborted = true;
    };
  }, [text]);

  const addFavorite = (track: any) => {
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

    setSaved(true);
    alert("保存しました！");
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    favs.push(track);
    localStorage.setItem("favorites", JSON.stringify(favs));
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

          <a href={t.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            Spotifyで聴く
          </a>
          <br />

          {t.preview_url ? (
            <audio
              src={t.preview_url}
              controls
              preload="none"
              data-audio
              onPlay={(e) => {
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

          {/* ✅ disabled属性は使わずデザイン維持 */}
          <button
            className={`favorite-btn ${saved ? "disabled" : ""}`}
            onClick={() => {
              if (!saved) addFavorite(t);
            }}
            style={saved ? { pointerEvents: "none" } : {}}
          >
            お気に入りに追加
          </button>
        </div>
      ))}

      <a href="/diary/history">
        <button style={{ marginTop: 20 }}>これまでの日記を見る</button>
      </a>
      <h3>
        <b>今日のあなたへ</b>
      </h3>
      <p>あなたを表現してくれる曲を選ぼう</p>

      {tracks.length === 0 ? (
        <p>おすすめの曲がまだありません。</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tracks.map((t, i) => {
            const title = t?.name ?? "Unknown title";
            const artist = t?.artists?.[0]?.name ?? "Unknown artist";
            const imageUrl = t?.album?.images?.[0]?.url;
            const spotifyUrl = t?.external_urls?.spotify;

            return (
              <li key={t?.id ?? t?.uri ?? i} className="track-item" style={{ marginBottom: 16 }}>
                {imageUrl && (
                  <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", marginBottom: 8, textDecoration: "none" }}
                  >
                    <img
                      src={imageUrl}
                      alt={`${title} のアルバム画像`}
                      width={120}
                      height={120}
                      style={{ borderRadius: 12, display: "block" }}
                    />
                  </a>
                )}

                <p style={{ margin: "4px 0 8px", fontWeight: 600 }}>
                  {title} / {artist}
                </p>

                {/* ✅ 30秒プレビュー（あれば表示） */}
                {t?.preview_url ? (
                  <audio
                    src={t.preview_url}
                    controls
                    preload="none"
                    data-audio
                    onPlay={(e) => {
                      // 同時再生防止
                      document.querySelectorAll('audio[data-audio]').forEach((el) => {
                        if (el !== e.currentTarget) (el as HTMLAudioElement).pause();
                      });
                    }}
                    style={{ display: "block", marginTop: 6 }}
                  />
                ) : (
                  <small style={{ display: "inline-block", marginTop: 6, opacity: 0.7 }}>
                    プレビュー音源なし
                  </small>
                )}

                <div style={{ marginTop: 8 }}>
                  <a href="/diary/history">
                    <button onClick={() => addFavorite(t)} style={{ marginLeft: 8 }}>
                      この曲にする
                    </button>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
