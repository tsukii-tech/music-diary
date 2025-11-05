// BottomBar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomBar() {
  const pathname = usePathname();
  const isActive = (p: string) => pathname === p;

  return (
    <nav
      className="
        fixed bottom-0 inset-x-0 z-50
        flex justify-around items-center
        py-2
        pointer-events-none   
      "
    >
      {/* ✍️ 書くボタン*/}
      <div className="pointer-events-auto">
        <Link href="/" scroll={false} className="block p-1">
          <Image
            src="/images/write.png"
            alt="書く"
            width={100}
            height={100}
            className={`transition-opacity duration-200 ${
              isActive("/") ? "opacity-50" : "opacity-100"
            }`}
          />
        </Link>
      </div>

      {/* 📘 一覧ボタン */}
      <div className="pointer-events-auto">
        <Link href="/diary/history" scroll={false} className="block p-1">
          <Image
            src="/images/read.png"
            alt="一覧"
            width={100}
            height={100}
            className={`transition-opacity duration-200 ${
              isActive("/diary/history") ? "opacity-50" : "opacity-100"
            }`}
          />
        </Link>
      </div>
    </nav>
  );
}
