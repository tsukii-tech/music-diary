"use client";
import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();


    // localStorageへ保存
    {/*const diaries = JSON.parse(localStorage.getItem("diaries") || "[]");
    diaries.push({
      content,
      date: new Date().toLocaleString(),
      iso: new Date().toISOString(),
    });
    localStorage.setItem("diaries", JSON.stringify(diaries));*/}

    localStorage.setItem("pendingDiaryContent", content);


    // 空にする
    setContent("");

    // 新ページへ。検索クエリに内容を渡す
    window.open(`/diary?text=${encodeURIComponent(content)}`, "_blank");

  };

  return (
    <main>
      <h1 className="titledayo">Music Day</h1>

      <form id="diary-form" onSubmit={handleSubmit}>
        <textarea className="note"

          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今日の日記を書いてください..."
          required
        />


        <button type="submit" style={{ display: 'block', margin: '0 auto' }}>きろくする</button>
      </form>
    </main>
  );
}
