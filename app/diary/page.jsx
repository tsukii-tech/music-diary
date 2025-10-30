"use client";
import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [tracks, setTracks] = useState([]);
  const [mood, setMood] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    // 感情分析
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    setMood(data.mood);

    // TODO: Spotify 取得処理もここに
  }

  return (
    <main>
      <h1 className="titledayo">Spotify Diary 🎵</h1>

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e)=>setContent(e.target.value)}
          placeholder="今日の日記を書いてください..."
        />
        <button type="submit">日記を保存しておすすめ音楽を見る</button>
      </form>

      <hr/>

      <h2>おすすめの音楽 🎶</h2>
      <div id="music">
        {mood && <p>感情: {mood}</p>}
      </div>
    </main>
  );
}
