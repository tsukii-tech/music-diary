"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";


export default function DiaryPage() {
  const params = useSearchParams();
  const text = params.get("text");
  const router = useRouter();


  return (
    <main>
      <h1>これまでの日記 📘</h1>
      <button
      className="backbtn"
      onClick={() => {
        if (window.history.length > 1) 
          {router.back();} else
          {router.push("/");}
      }} >前のページへ</button>

      <a class="pagetop" href="#"><div class="pagetop__arrow"></div></a>

      {text ? (
        <div className="note">
              <div class="demo01__ribbon">
        <h3 class="demo01__title">New</h3>
    </div>
          <p>{text}</p>
        </div>
      ) : (
        <p>データがありません。</p>
      )}
      

    </main>
  );
}
