import type { Metadata } from "next";
import Nav from "@/components/Nav";
import SmoothScroll from "@/components/SmoothScroll";
import { DEVELOPER } from "@/lib/developer";
import "lenis/dist/lenis.css";
import "./globals.css";

export const metadata: Metadata = {
  title: `Guestbook — ${DEVELOPER.name} ${DEVELOPER.studentId}`,
  description: "로그인 없이 이름과 메시지를 남기고, 비밀번호로 내 글만 고치고 지우는 미니 방명록",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <SmoothScroll />
        <Nav />
        {children}
        <footer className="footer">
          <p>
            개발자 <strong>{DEVELOPER.name}</strong> · 학번 <strong>{DEVELOPER.studentId}</strong> ·{" "}
            {DEVELOPER.school}
          </p>
          <p className="footer__sub">Next.js · TypeScript · Neon Postgres · Vercel</p>
        </footer>
      </body>
    </html>
  );
}
