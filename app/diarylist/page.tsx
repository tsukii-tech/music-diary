"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DiaryListPage() {
    const searchParams = useSearchParams();
    const [text, setText] = useState("");

    useEffect(() => {
        setText(searchParams.get("text") || "");
    }, [searchParams]);

    return (
        <main>
        <h2>あなたの日記</h2>
        <p>{text}</p>
        </main>
    );
}
