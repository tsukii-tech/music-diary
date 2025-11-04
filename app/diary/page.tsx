"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DiaryPage() {
  const [diaries, setDiaries] = useState<any[]>([]);
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("diaries") || "[]");
    setDiaries(saved.reverse()); // 新しい順に
  }, []);

  return (
    <main>
      <h2>これまでの日記 📘</h2>
      {diaries.length === 0 && <p>まだ日記はありません。</p>}

      <ul>
        {diaries.map((d, idx) => (
          <li key={idx} className="diary-item">
            {idx === 0 && (
              <div className="demo01__ribbon entry-ribbon"><p className="demo01__title">New</p></div>
            )}
            <p><b>{d.date}</b></p>
            <div className="note">
              <p>{d.content}</p>
            </div>
            <hr />
          </li>
        ))}
      </ul>
      <button className="backbtn" onClick={handleBack}>前のページへ</button>
    </main>
  );
}
