"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    window.open(`/diary?text=${encodeURIComponent(content)}`, "_blank");
    setContent(""); // 送信後に消す！
  };

  return (
    <main>
      <h1 className="titledayo">Music Day</h1>

      <form onSubmit={handleSubmit}>
        <textarea
          id="content"
          placeholder="今日の日記を書いてください..."
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        <br /><br />
        <button type="submit">日記を保存しておすすめ音楽を見る</button>
      </form>
    </main>
  );
}

