"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
export default function DiaryPage() {
    const searchParams = useSearchParams();
    const [text, setText] = useState("");
=======
=======
>>>>>>> 9e1583be85268a66c15e3960c2d40e3f3febc898
=======
>>>>>>> 9e1583be85268a66c15e3960c2d40e3f3febc898
>>>>>>> Stashed changes

export default function DiaryListPage() {
    const [diaries, setDiaries] = useState<any[]>([]);
>>>>>>> 9e1583be85268a66c15e3960c2d40e3f3febc898

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
