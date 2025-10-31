"use client";
import "./style.css";

import { useState, useEffect } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [tracks, setTracks] = useState([]); // Spotify結果を入れる
  const [mood, setMood] = useState("");
  const [diaries, setDiaries] = useState([]);

  // 起動時に localStorage から日記を読み込む
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("diaries") || "[]");
      setDiaries(saved);
    } catch (e) {
      setDiaries([]);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;

    // 1) サーバーに感情分析を依頼
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    const detectedMood = data.mood || "neutral";
    setMood(detectedMood);

    // 2) Spotify から楽曲を取得（APIが mood を返す場合は /api/recommend が tracks を返すことも想定）
    //    ここでは API が { mood, tracks } を返す想定にしています
    const returnedTracks = data.tracks || data.tracks?.items || [];
    setTracks(returnedTracks);

    // 3) 日記を localStorage に保存（履歴）
    const newDiary = {
      content,
      mood: detectedMood,
      date: new Date().toLocaleString("ja-JP"),
    };
    const updated = [...diaries, newDiary];
    setDiaries(updated);
    localStorage.setItem("diaries", JSON.stringify(updated));

    // 4) 別ページ（/diary）を新しいタブで開く（既に Next.js に diary ページがあればそちらを開く）
    //    public に diary.html が残っているならそれを開くこともできます：window.open("/diary", "_blank");
    window.open("/diary", "_blank");

    // 5) フォームをクリア
    setContent("");
  }

  // 「別のおすすめを見る」ボタンで再取得（同じ content,mood で再取得）
  async function refreshRecommendations() {
    // ここでは content を再利用するので簡易的に再送信
    if (!content && diaries.length > 0) {
      // contentが空なら直近の日記を使う（任意）
      const last = diaries[diaries.length - 1];
      await fetchRecommendations(last.content);
    } else {
      await fetchRecommendations(content);
    }
  }

  async function fetchRecommendations(text) {
    if (!text) return;
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    const data = await res.json();
    setMood(data.mood || "neutral");
    const returnedTracks = data.tracks || data.tracks?.items || [];
    setTracks(returnedTracks);
  }

  return (
    <main style={{ padding: 20 }}>
      <h1 className="titledayo">Spotify Diary 🎵</h1>

      {/* フォーム（index.html の <form> に対応） */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今日の日記を書いてください..."
          style={{ width: "100%", height: 120 }}
        />
        <br />
        <button type="submit">日記を保存しておすすめ音楽を見る</button>
      </form>

      <hr />

      <h2>おすすめの音楽 🎶</h2>
      <div id="music">
        {mood && <p>感情: <b>{mood}</b></p>}

        {tracks && tracks.length > 0 ? (
          tracks.map((track) => (
            <div key={track.id} className="track-item" style={{ marginBottom: 12 }}>
              <p><b>{track.name}</b> - {track.artists?.[0]?.name}</p>
              <iframe
                title={track.name}
                src={`https://open.spotify.com/embed/track/${track.id}`}
                width="300"
                height="80"
                frameBorder="0"
                allowTransparency="true"
                allow="encrypted-media"
              />
            </div>
          ))
        ) : (
          <p>おすすめ曲はまだありません。</p>
        )}

        {/* 再提案ボタン */}
        <div style={{ marginTop: 8 }}>
          <button type="button" onClick={refreshRecommendations}>別のおすすめを見る 🔁</button>
        </div>
      </div>

      <hr />

      {/* 履歴表示（index.html の日記一覧に対応。Next側で不要なら省略可） */}
      <h2>これまでの日記 📖</h2>
      <ul>
        {diaries.slice().reverse().map((d, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            <p><b>{d.date}</b> | 感情：{d.mood}</p>
            <p>{d.content}</p>
            <hr />
          </li>
        ))}
      </ul>
    </main>
  );
}
