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
        <main style={{ padding: 20 }}>
        <h2>これまでの日記 📚</h2>
        {diaries.length === 0 && <p>まだ日記はありません。</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
            {diaries.map((d, idx) => (
            <li key={d.iso} style={{ position: "relative", marginBottom: 20 }}>
                {idx === 0 && (
                <div
                    className="demo01__ribbon"
                    style={{ position: "absolute", left: 10, top: -10 }}
                >
                    <p className="demo01__title">NEW</p>
                </div>
                )}

                <div className="note" style={{ position: "relative", paddingTop: 18 }}>
                {/* 日付と日記文 */}
                <p><b>{d.date}</b></p>
                <p style={{ whiteSpace: "pre-wrap" }}>{d.content}</p>

                {/* ✅曲が登録されている場合のみ表示 */}
                {d.music && (
                    <div style={{ marginTop: 10, paddingTop: 10 }}>
                    <p><b>お気に入り曲 🎧</b></p>

                    {/*  
                    {d.music.image && (
                        <div style={{marginTop:10, marginLeft: 480, marginBottom:5}}>
                            <img
                            src={d.music.image}
                            alt={d.music.title}
                            width={120}
                            height={120}
                            />
                        </div>
                    )}
                    */}
                    {/* 曲目 */}
                    <p>{d.music.title} - {d.music.artist}</p>

                    {/* Spotifyリンク */}
                    <a href={d.music.url} target="_blank" rel="noopener noreferrer">
                        Spotifyで聴く 
                    </a>
                    </div>
                )}
                </div>
            </li>
            ))}
        </ul>
        </main>
    );
    }
