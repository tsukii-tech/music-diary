"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // 別タブへ移動
    window.open(`/diary?text=${encodeURIComponent(content)}`, "_blank");
  };

  return (
    <main>
      <h1 className="titledayo">Spotify Diary 🎵</h1>

      <form id="diary-form">
        <textarea id="content" placeholder="今日の日記を書いてください..." required></textarea>
        <br />

        {/* <label>今日の気分を選択：</label> */}
        {/* <select id="mood">
          <option value="happy">😊 わーい</option>
          <option value="sad">😢 悲しい</option>
          <option value="energetic">💪 元気</option>
          <option value="relax">😌 リラックス</option>
        </select> */}

        <br /><br />
        <button type="submit">日記を保存しておすすめ音楽を見る</button>
      </form>
    </main>
  );
}
