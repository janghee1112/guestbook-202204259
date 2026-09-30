"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import type { Entry } from "@/lib/guestbook";
import { MESSAGE_MAX, PASSWORD_MAX, memoHex } from "@/lib/entry-rules";
import { formatKst } from "@/lib/format";
import { lockScroll, prefersReducedMotion } from "@/lib/motion";
import { shake } from "./shake";

type Mode = "view" | "edit" | "delete";

type Props = {
  entry: Entry;
  /** 패널이 빨려 나오고 돌아갈 카드 요소 */
  getOrigin: () => HTMLElement | null;
  onClose: () => void;
  onUpdated: (entry: Entry) => void;
  onDeleted: (id: string) => void;
};

const EASE = "power3.inOut";
/** CSS 가운데 정렬(inset:0 + margin:auto)을 풀고 좌표로 움직이기 위한 값 */
const FREE = { margin: 0, right: "auto", bottom: "auto" };

/**
 * 글 상세 패널. 누른 카드가 제자리에서 커지며 화면 중앙 패널이 되고(공유 요소 전환),
 * 닫으면 다시 카드 위치로 줄어든다. 비밀번호로 수정·삭제한다.
 */
export default function EntryPanel({ entry, getOrigin, onClose, onUpdated, onDeleted }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const closing = useRef(false);

  const [mode, setMode] = useState<Mode>("view");
  const [draft, setDraft] = useState(entry.message);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const originBox = useCallback(() => {
    const rect = getOrigin()?.getBoundingClientRect();
    const onScreen = rect && rect.bottom > 0 && rect.top < innerHeight && rect.width > 0;
    return onScreen ? rect : null;
  }, [getOrigin]);

  // 열기: 카드 크기·위치 → 최종 패널 크기·위치로
  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    const content = contentRef.current;
    if (!sheet || !content) return;
    lockScroll(true);
    const main = document.querySelector("main");

    if (prefersReducedMotion()) {
      gsap.fromTo([backdropRef.current, sheet], { opacity: 0 }, { opacity: 1, duration: 0.15 });
      return () => lockScroll(false);
    }

    const final = sheet.getBoundingClientRect();
    const from = originBox();
    const tl = gsap.timeline();
    tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0);
    if (main) {
      gsap.set(main, { transformOrigin: `50% ${scrollY + innerHeight / 2}px` });
      tl.to(main, { scale: 0.96, duration: 0.6, ease: EASE }, 0);
    }
    if (from) {
      tl.fromTo(
        sheet,
        { ...FREE, top: from.top, left: from.left, width: from.width, height: from.height, borderRadius: 24 },
        {
          ...FREE,
          top: final.top,
          left: final.left,
          width: final.width,
          height: final.height,
          borderRadius: 32,
          duration: 0.65,
          ease: EASE,
          clearProps: "top,left,width,height,borderRadius,margin,right,bottom",
        },
        0,
      );
    } else {
      tl.fromTo(sheet, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, 0);
    }
    tl.fromTo(content, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0.4);
    return () => {
      tl.kill();
      if (main) gsap.set(main, { clearProps: "transform,transformOrigin" });
      lockScroll(false);
    };
  }, [originBox]);

  // 닫기: 패널 → 카드 위치로 줄어들기(카드가 없으면 작아지며 사라지기)
  const close = useCallback(
    (after?: () => void) => {
      if (closing.current) return;
      closing.current = true;
      const finish = () => {
        after?.();
        onClose();
      };
      const sheet = sheetRef.current;
      if (!sheet || prefersReducedMotion()) return finish();

      const main = document.querySelector("main");
      const to = after ? null : originBox(); // 삭제 후에는 돌아갈 카드가 없다
      const now = sheet.getBoundingClientRect();
      const tl = gsap.timeline({ onComplete: finish });
      tl.to(contentRef.current, { opacity: 0, duration: 0.18, ease: "power1.in" }, 0);
      if (to) {
        tl.fromTo(
          sheet,
          { ...FREE, top: now.top, left: now.left, width: now.width, height: now.height },
          { ...FREE, top: to.top, left: to.left, width: to.width, height: to.height, borderRadius: 24, duration: 0.55, ease: EASE },
          0.08,
        );
      } else {
        tl.to(sheet, { opacity: 0, scale: 0.9, filter: "blur(6px)", duration: 0.45, ease: "power2.in" }, 0.05);
      }
      tl.to(backdropRef.current, { opacity: 0, duration: 0.45, ease: "power2.in" }, 0.1);
      if (main) tl.to(main, { scale: 1, duration: 0.55, ease: EASE }, 0.05);
    },
    [onClose, originBox],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (mode !== "view") passwordRef.current?.focus();
  }, [mode]);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
    setPassword("");
    setDraft(entry.message);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/entries/${entry.id}`, {
        method: mode === "edit" ? "PATCH" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "edit" ? { password, message: draft } : { password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "요청을 처리하지 못했어요.");
        shake(passwordRef.current?.closest(".field") ?? null);
        if (res.status === 404) onDeleted(entry.id);
        return;
      }
      if (mode === "edit") {
        onUpdated(data as Entry);
        setMode("view");
        setPassword("");
        setNotice("메시지를 수정했어요.");
      } else {
        close(() => onDeleted(entry.id));
      }
    } catch {
      setError("네트워크 오류가 났어요. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div className="overlay" role="dialog" aria-modal="true" aria-label={`${entry.name}님의 글`}>
      <div ref={backdropRef} className="overlay__backdrop" onClick={() => close()} />
      <div ref={sheetRef} className="sheet" style={{ background: memoHex(entry.color) }}>
        <div ref={contentRef} className="sheet__content">
          <div className="sheet__top">
            <div className="sheet__who">
              <span className="card__avatar card__avatar--emoji card__avatar--lg" aria-hidden>
                {entry.emoji}
              </span>
              <div>
                <p className="sheet__name">{entry.name}</p>
                <p className="sheet__time">
                  {formatKst(entry.createdAt)}
                  {entry.updatedAt && <span className="tag">수정됨 · {formatKst(entry.updatedAt)}</span>}
                </p>
              </div>
            </div>
            <button type="button" className="icon-btn" onClick={() => close()} aria-label="닫기">
              ✕
            </button>
          </div>

          {mode === "edit" ? (
            <form onSubmit={submit} className="sheet__form">
              <label className="field">
                <span className="field__label">
                  메시지 수정 <em>{draft.length}/{MESSAGE_MAX}</em>
                </span>
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={MESSAGE_MAX} rows={4} required />
              </label>
              <PasswordField value={password} onChange={setPassword} inputRef={passwordRef} />
              {error && <p role="alert" className="note note--error">{error}</p>}
              <div className="sheet__actions">
                <button type="button" className="btn btn--ghost" onClick={() => switchMode("view")}>취소</button>
                <button type="submit" className="btn btn--primary" disabled={busy || !password}>
                  {busy ? "저장 중…" : "저장"}
                </button>
              </div>
            </form>
          ) : mode === "delete" ? (
            <form onSubmit={submit} className="sheet__form">
              <p className="sheet__message sheet__message--dim">{entry.message}</p>
              <p className="warn">이 글을 영구 삭제합니다. 글을 쓸 때 정한 비밀번호를 입력하세요.</p>
              <PasswordField value={password} onChange={setPassword} inputRef={passwordRef} />
              {error && <p role="alert" className="note note--error">{error}</p>}
              <div className="sheet__actions">
                <button type="button" className="btn btn--ghost" onClick={() => switchMode("view")}>취소</button>
                <button type="submit" className="btn btn--danger" disabled={busy || !password}>
                  {busy ? "삭제 중…" : "정말 삭제"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="sheet__message">{entry.message}</p>
              {notice && <p role="status" className="note note--ok">{notice}</p>}
              <div className="sheet__actions">
                <button type="button" className="btn btn--ghost" onClick={() => switchMode("edit")}>수정</button>
                <button type="button" className="btn btn--ghost btn--danger-text" onClick={() => switchMode("delete")}>
                  삭제
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function PasswordField({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <label className="field">
      <span className="field__label">비밀번호</span>
      <input
        ref={inputRef}
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={PASSWORD_MAX}
        required
        placeholder="글을 쓸 때 정한 비밀번호"
        autoComplete="current-password"
      />
    </label>
  );
}
