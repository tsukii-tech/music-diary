"use client";
import { useEffect, useState } from "react";

export default function FavoritePage() {
    const [favorites, setFavorites] = useState<any[]>([]);

    useEffect(() => {
        const raw = JSON.parse(localStorage.getItem("favorites") || "[]");
        setFavorites(raw);
    }, []);

    return (
        <main style={{ padding: 20 }}>
        <h2>お気に入り一覧 ❤️</h2>

        {favorites.length === 0 && <p>まだありません。</p>}

        {favorites.map((t) => (
            <div key={t.id} className="track-item">
            <p>{t.name} / {t.artists[0].name}</p>
            <a href={t.external_urls.spotify} target="_blank">Spotifyで聴く</a>
            </div>
        ))}
        </main>
    );
}
