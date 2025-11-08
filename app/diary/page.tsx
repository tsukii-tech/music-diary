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

  // お気に入り追加
  const addFavorite = (track: any) => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    favs.push(track);
    localStorage.setItem("favorites", JSON.stringify(favs));
  };

  return (
    <main style={{ padding: 20 }}>
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
