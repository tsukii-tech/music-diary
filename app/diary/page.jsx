"use client";
import { useSearchParams } from "next/navigation";

export default function DiaryPage() {
  const params = useSearchParams();
  const text = params.get("text");

  return (
    <main>
      <h1>これまでの日記 📘</h1>

      {text ? (
        <div>
          <p><b>今回の入力:</b></p>
          <p>{text}</p>
        </div>
      ) : (
        <p>データがありません。</p>
      )}
    </main>
  );
}
