"use client";
import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();

    // ローカルストレージ取得
    const diaries = JSON.parse(localStorage.getItem("diaries") || "[]");

    // 新しい日記を追加
    diaries.push({
      date: new Date().toLocaleString(),
      content: content
    });

    // 保存
    localStorage.setItem("diaries", JSON.stringify(diaries));

    // 入力欄をリセット
    setContent("");

    // 一覧ページを新タブで開く
    window.open(`/diary`, "_blank");
  };

  return (
    <main>
      <h1 className="titledayo">Music Day</h1>

      <form id="diary-form" onSubmit={handleSubmit}>
        <textarea
          className="note"
          id="content"
          placeholder="今日の日記を書いてください..."
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <br /><br />

        <button type="submit">日記を保存しておすすめ音楽を見る</button>
      </form>
    </main>
  );
}
