    "use client";
    import { useEffect, useState } from "react";

    export default function DiaryHistoryPage() {
    const [diaries, setDiaries] = useState<any[]>([]);

    useEffect(() => {
        const raw = JSON.parse(localStorage.getItem("diaries") || "[]");

        const normalized = raw.map((d: any) => ({
        content: d.content || "",
        date: d.date || "",
        iso: d.iso || (d.date ? new Date(d.date).toISOString() : new Date().toISOString()),
        music: d.music || null, // ← ✅ music を拾う
        }));

        const sorted = [...normalized].sort((a, b) => {
        if (a.iso < b.iso) return 1;
        if (a.iso > b.iso) return -1;
        return 0;
        });

        setDiaries(sorted);
    }, []);

    return (
        <main style={{ padding: 20 }} >
        <h2 className="komidasidayo"><b>大切な音色と思い出</b></h2>
        {diaries.length === 0 && <p>まだ日記はありません。</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
            {diaries.map((d, idx) => (
            <li key={d.iso} style={{ position: "relative", marginBottom: 20 }}>
                

                <div className="note" style={{ position: "relative", paddingTop: 18 }}>
                {/* 日付と日記文 */}
                <p><b>{d.date}</b></p>
                <p style={{ whiteSpace: "pre-wrap" }}>{d.content}</p>

                {/* ✅曲が登録されている場合のみ表示 */}
                {d.music && (
  <div style={{
    marginTop: 12,
    borderTop: "1px solid #ccc",
    paddingTop: 10,
  }}>
    {/* 横並びにして、狭い画面では縦並びにする */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",       // ✅ スマホでは自動で縦に折り返す
        justifyContent: "center" // ✅ 中央寄せにする
      }}
    >
      {/* 左：画像 */}
      {d.music.image && (
        <img
          src={d.music.image}
          alt={d.music.title}
          style={{
            borderRadius: 8,
            objectFit: "cover",
            width: "30vw",        // ✅ 画面幅の30％を使う
            maxWidth: "160px",    // ✅ これ以上大きくならない
            height: "auto",
            margin: "0 auto",
          }}
        />
      )}

      {/* 右：テキスト部分 */}
      <div style={{
        flex: 1,
        minWidth: "200px",       // ✅ 狭すぎないように
        textAlign: "center",
      }}>
        <p style={{ margin: "6px 0", fontWeight: 700 }}>
          {d.music.title} - {d.music.artist}
        </p>
        <a
          href={d.music.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none", color: "#534947", fontWeight: "bold" }}
        >
          Spotifyで聴く
        </a>
      </div>
    </div>
  </div>
)}


                </div>
            </li>
            ))}
        </ul>
        </main>
    );
    }
