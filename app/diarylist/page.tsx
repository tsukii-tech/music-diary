"use client";
import { useEffect, useState } from "react";

export default function DiaryListPage() {
    const [diaries, setDiaries] = useState<any[]>([]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("diaries") || "[]");
        setDiaries(data.reverse());
    }, []);

    if (diaries.length === 0) {
        return <p>まだ日記はありません。</p>;
    }

    return (
        <main style={{ padding: "20px" }}>
        <h1>これまでの日記 📘</h1>
        <ul>
            {diaries.map((d, i) => (
            <li key={i} style={{ marginBottom: "14px" }}>
                <p>
                <b>{d.date}</b> | 気分：{d.mood}
                </p>
                <p style={{ whiteSpace: "pre-wrap" }}>{d.content}</p>
                <hr />
            </li>
            ))}
        </ul>
        </main>
    );
    }
