document.getElementById("diary-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = document.getElementById("content").value;
  const mood = document.getElementById("mood").value;

  // --- 📘 日記を保存（ローカルストレージ利用） ---
  saveDiary(content, mood);
  displayDiaries();

  // --- 🎵 曲を取得して描画する関数 ---
  async function loadRecommendations() {
    const res = await fetch("/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, mood }),
    });

    const data = await res.json();
    const musicDiv = document.getElementById("music");
    musicDiv.innerHTML = `<p>感情: ${mood}</p>`;

    const tracks = data.tracks?.items;

    if (tracks && tracks.length > 0) {
      tracks.forEach(track => {
        const trackEl = document.createElement("div");
        trackEl.classList.add("track-item");
        trackEl.innerHTML = `
          <p><b>${track.name}</b> - ${track.artists[0].name}</p>
          <iframe 
            src="https://open.spotify.com/embed/track/${track.id}" 
            width="300" height="80" frameborder="0" 
            allowtransparency="true" allow="encrypted-media">
          </iframe>
        `;
        musicDiv.appendChild(trackEl);
      });

      // 🔁 再提案ボタンを追加
      const refreshButton = document.createElement("button");
      refreshButton.textContent = "別のおすすめを見る 🔁";
      refreshButton.addEventListener("click", loadRecommendations);
      musicDiv.appendChild(refreshButton);

    } else {
      musicDiv.innerHTML += "<p>おすすめ曲を取得できませんでした。</p>";
    }
  }

  // 初回読み込み
  await loadRecommendations();

  // 入力フォームをリセット
  document.getElementById("content").value = "";
  document.getElementById("mood").selectedIndex = 0;
});


// --- 📘 日記履歴をローカルストレージに保存 ---
function saveDiary(content, mood) {
  const diaries = JSON.parse(localStorage.getItem("diaries") || "[]");
  const newDiary = {
    content,
    mood,
    date: new Date().toLocaleString("ja-JP"),
  };
  diaries.push(newDiary);
  localStorage.setItem("diaries", JSON.stringify(diaries));
}


// --- 📖 日記履歴を表示 ---
function displayDiaries() {
  const diaryList = document.getElementById("diary-list");
  const diaries = JSON.parse(localStorage.getItem("diaries") || "[]");

  if (diaries.length === 0) {
    diaryList.innerHTML = "<p>まだ日記はありません。</p>";
    return;
  }

  diaryList.innerHTML = "";
  diaries.slice().reverse().forEach((d) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <p><b>${d.date}</b> | 気分：${d.mood}</p>
      <p>${d.content}</p>
      <hr>
    `;
    diaryList.appendChild(li);
  });
}

// ページ読み込み時に履歴を表示
document.addEventListener("DOMContentLoaded", displayDiaries);
