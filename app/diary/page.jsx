"use client";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function DiaryPage() {
  const params = useSearchParams();
  const text = params.get("text");
  const router = useRouter();

 // ★ URLの?text=... を検知して localStorage に追記しておく
useEffect(() => {
if (!text) return;
const list = JSON.parse(localStorage.getItem("diaries") || "[]");
list.push({
id: (crypto?.randomUUID && crypto.randomUUID()) || Date.now(),
date: new Date().toLocaleString("ja-JP", { hour12: false }),
mood: null,                    // 気分を使うならここに入れてOK
content: text,                 // ← 入力テキスト
});
localStorage.setItem("diaries", JSON.stringify(list));
}, [text]);

  return (
    <main>
      <h1>これまでの日記 📘</h1>
      <button
      className="backbtn"
      onClick={() => {
        if (window.history.length > 1) 
          {router.back();} else
          {router.push("/");}
      }} >前のページへ</button>

      <a class="pagetop" href="#"><div class="pagetop__arrow"></div></a>

      {text ? (
        <div className="note">
              <div class="demo01__ribbon">
        <h3 class="demo01__title">New</h3>
    </div>
          <p>{text}</p>
        </div>
      ) : (
        <p>データがありません。</p>
      )}
      

    </main>
  );
}
