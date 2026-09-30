"use client";

import { useEffect, useState } from "react";
import { DEVELOPER } from "@/lib/developer";
import { scrollToId } from "@/lib/motion";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <div className="nav__inner">
        <button type="button" className="nav__brand" onClick={() => window.scrollTo({ top: 0 })}>
          Guestbook
        </button>
        <nav className="nav__links" aria-label="섹션">
          <button type="button" onClick={() => scrollToId("write")}>글쓰기</button>
          <button type="button" onClick={() => scrollToId("entries")}>방명록</button>
        </nav>
        <p className="nav__dev">
          {DEVELOPER.name} <span>· {DEVELOPER.studentId}</span>
        </p>
      </div>
    </header>
  );
}
