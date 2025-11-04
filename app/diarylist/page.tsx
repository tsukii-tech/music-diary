"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function DiaryPage() {
    const searchParams = useSearchParams();
    const [text, setText] = useState("");
    const router = useRouter();
    const handleBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push("/");
        }
    };

    useEffect(() => {
        setText(searchParams.get("text") || "");
    }, [searchParams]);

   
}
