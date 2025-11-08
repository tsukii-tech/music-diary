"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 重複除去（id → uri → name-artist）
function dedupeTracks(arr: any[]) {
  const map = new Map<string, any>();
  for (const t of arr) {
    const key =
      t?.id ??
      t?.uri ??
      `${t?.name ?? ""}-${t?.artists?.[0]?.name ?? ""}`.toLowerCase();
    if (!map.has(key)) map.set(key, t);
  }
  return Array.from(map.values());
}

export default function DiaryPage() {
  const router = useRouter();

  const [text, setText] = useState("");
  const [tracks, setTracks] = useState<any[]>([]);
  const [mood, setMood] = useState("");
  const [selected, setSelected] = useState<string>(""); // どの曲を選んだか（保存ガード）

  // ① 初回だけ URL の ?text= を取り込み → sessionStorage 印を付けてから URL から除去
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const t = params.get("text") || "";

    if (t) {
      setText(t);
      sessionStorage.setItem(`incoming:${t}`, "1");
      // 再マウント競合を避けるため次ティックでURLをクリーンに
      setTimeout(() => {
        if (window.location.search.includes("text=")) {
          router.replace("/diary");
        }
      }, 0);
    }
  }, [router]);

  // ② レコメンド取得（同じ text は一度だけ）＋ 重複除去＋ history更新
  useEffect(() => {
    if (!text) return;

    const fetchedKey = `fetched:${text}`;
    if (sessionStorage.getItem(fetchedKey)) return; // 取得済みならスキップ
    sessionStorage.setItem(fetchedKey, "1");

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

        const got = Array.isArray(data?.tracks) ? data.tracks : [];
        const unique = dedupeTracks(got);

        setMood(data?.mood ?? "");
        setTracks(unique);

        // history も重複しないように更新
        const old = Array.isArray(history) ? history : [];
        const newer = Array.from(
          new Set([...old, ...unique.map((t: any) => t.id).filter(Boolean)])
        );
        localStorage.setItem("history", JSON.stringify(newer));
      } catch (e) {
        console.error(e);
        setTracks([]);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [text]);

  // ③ この曲にする（＝ 日記＋音楽セットで保存）
  const addFavorite = (track: any) => {
    if (selected) return; // 既に保存済みならブロック

    const content =
      localStorage.getItem("pendingDiaryContent") || text || ""; // pendingが無ければtextも fallback
    const diaries = JSON.parse(localStorage.getItem("diaries") || "[]");

    diaries.push({
      date: new Date().toLocaleString("ja-JP", { hour12: false }),
      iso: new Date().toISOString(),
      content,
      music: {
        title: track?.name,
        artist: track?.artists?.[0]?.name,
        url: track?.external_urls?.spotify,
        image: track?.album?.images?.[0]?.url,
      },
    });

    localStorage.setItem("diaries", JSON.stringify(diaries));
    localStorage.removeItem("pendingDiaryContent");
    setSelected(track?.id ?? "selected");


  };

  return (
    <main style={{ padding: 20 }}>
      <h3 className="komidasidayo">
        <b>今日のあなたを表す曲は…</b>
      </h3>
      

      {tracks.length === 0 ? (
        <p>おすすめの曲がまだありません。</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }} >
          {tracks.map((t, i) => {
            const title = t?.name ?? "Unknown title";
            const artist = t?.artists?.[0]?.name ?? "Unknown artist";
            const imageUrl = t?.album?.images?.[0]?.url;
            const spotifyUrl = t?.external_urls?.spotify;

            const alreadyChosen = selected && selected === (t?.id ?? "");

            return (
              <li 
                key={t?.id ?? t?.uri ?? `${title}-${artist}-${i}`}
                style={{ marginBottom: 16, opacity: alreadyChosen ? 0.7 : 1,
                  background: "rgba(255,255,255,0.35)",
                  borderRadius: 12,
                  padding: 16,
                  margin: "16px auto",
                  width: "90%",
                 }}

              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}></div>
                {imageUrl && (
                  
                  <a 
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", marginBottom: 8 }}
                  >
                    
                    <img className="track-cover"
                      src={imageUrl}
                      alt={`${title} のアルバム画像`}
                      width={120}
                      height={120}
                      style={{ borderRadius: 12, display: "block" }}
                    />
                  </a>
                )}

                <p className="track-main" style={{ margin: "4px 0 8px", fontWeight: 600 }}>
                  {title} / {artist}
                </p>

                {t?.preview_url ? (
                  <audio
                    src={t.preview_url}
                    controls
                    preload="none"
                    data-audio
                    onPlay={(e) => {
                      document.querySelectorAll('audio[data-audio]').forEach((el) => {
                        if (el !== e.currentTarget)
                          (el as HTMLAudioElement).pause();
                      });
                    }}
                    style={{ display: "block", marginTop: 6 }}
                  />
                ) : (
                  <small
                    style={{ display: "inline-block", marginTop: 6, opacity: 0.7 }}
                  >
                    プレビュー音源なし
                  </small>
                )}

                <div style={{ marginTop: 8 }}>
                  <a href="/diary/history">
                    <button
                      onClick={() => addFavorite(t)}
                      disabled={!!selected}
                      style={{ marginLeft: 8, opacity: selected ? 0.6 : 1 }}
                    >
                      {"この曲にする"}
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
