"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Entry } from "@/lib/guestbook";
import { formatKst } from "@/lib/format";
import { prefersReducedMotion } from "@/lib/motion";
import EntryPanel from "./EntryPanel";
import WriteForm from "./WriteForm";

/** 글쓰기 + 글 목록 + 상세 패널. 목록 상태는 여기서 관리한다. */
export default function Guestbook({ initialEntries }: { initialEntries: Entry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());

  // 스크롤 등장: 화면에 들어오는 요소를 아래에서 떠오르며 선명하게, 순차로
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      gsap.set(items, { opacity: 0, y: 32, filter: "blur(8px)" });
      ScrollTrigger.batch(items, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            overwrite: true,
          }),
      });
    }, sectionRef);
    return () => ctx.revert();
    // 처음 한 번만: 새로 추가되는 카드는 별도 애니메이션으로 등장
  }, []);

  // 새 글: 목록 맨 위에 부드럽게 끼어들기
  useLayoutEffect(() => {
    if (!newId) return;
    const el = cardRefs.current.get(newId);
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0, filter: "none" });
      return;
    }
    gsap.fromTo(
      el,
      { opacity: 0, y: -24, scale: 0.94, filter: "blur(6px)" },
      { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
    );
    const flash = setTimeout(() => setNewId(null), 2200);
    return () => clearTimeout(flash);
  }, [newId]);

  const handleCreated = useCallback((entry: Entry) => {
    setEntries((prev) => [entry, ...prev]);
    setNewId(entry.id);
  }, []);

  const openEntry = entries.find((e) => e.id === openId) ?? null;

  return (
    <div ref={sectionRef}>
      <section id="write" className="section section--white">
        <div className="container container--narrow">
          <p data-reveal className="eyebrow">Write</p>
          <h2 data-reveal className="section__title">메시지를 남겨주세요.</h2>
          <p data-reveal className="section__lead">
            비밀번호는 나중에 내 글을 고치거나 지울 때만 쓰여요. 안전하게 암호화해서 저장해요.
          </p>
          <div data-reveal>
            <WriteForm onCreated={handleCreated} />
          </div>
        </div>
      </section>

      <section id="entries" className="section section--gray">
        <div className="container">
          <div className="entries__head">
            <div>
              <p data-reveal className="eyebrow">Guestbook</p>
              <h2 data-reveal className="section__title">남겨진 이야기들.</h2>
            </div>
            <p data-reveal className="entries__count">
              <strong>{entries.length}</strong>개의 글 · 최신순
            </p>
          </div>

          {entries.length === 0 ? (
            <div data-reveal className="empty">
              <p className="empty__title">아직 아무도 글을 남기지 않았어요.</p>
              <p className="empty__sub">첫 번째 글의 주인공이 되어 보세요.</p>
            </div>
          ) : (
            <ul className="grid">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    data-reveal={entry.id === newId ? undefined : ""}
                    ref={(el) => {
                      if (el) cardRefs.current.set(entry.id, el);
                      else cardRefs.current.delete(entry.id);
                    }}
                    className={`card ${entry.id === newId ? "card--new" : ""} ${entry.id === openId ? "card--hidden" : ""}`}
                    onClick={() => setOpenId(entry.id)}
                    aria-label={`${entry.name}님의 글 열기`}
                  >
                    <p className="card__message">{entry.message}</p>
                    <div className="card__meta">
                      <span className="card__avatar" aria-hidden>
                        {entry.name.slice(0, 1)}
                      </span>
                      <span className="card__name">{entry.name}</span>
                      <span className="card__time">
                        {formatKst(entry.createdAt)}
                        {entry.updatedAt && <span className="tag">수정됨</span>}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {openEntry && (
        <EntryPanel
          entry={openEntry}
          getOrigin={() => cardRefs.current.get(openEntry.id) ?? null}
          onClose={() => setOpenId(null)}
          onUpdated={(updated) =>
            setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
          }
          onDeleted={(id) => setEntries((prev) => prev.filter((e) => e.id !== id))}
        />
      )}
    </div>
  );
}
