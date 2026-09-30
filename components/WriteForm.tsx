"use client";

import { useRef, useState } from "react";
import type { Entry } from "@/lib/guestbook";
import {
  DEFAULT_COLOR,
  DEFAULT_EMOJI,
  EMOJIS,
  MEMO_COLORS,
  MESSAGE_MAX,
  NAME_MAX,
  PASSWORD_MAX,
  PASSWORD_MIN,
  memoHex,
  type MemoColor,
} from "@/lib/entry-rules";
import { shake } from "./shake";

export default function WriteForm({ onCreated }: { onCreated: (entry: Entry) => void }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [emoji, setEmoji] = useState<string>(DEFAULT_EMOJI);
  const [color, setColor] = useState<MemoColor>(DEFAULT_COLOR);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDone(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, password, emoji, color }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "글을 남기지 못했어요. 다시 시도해 주세요.");
        shake(formRef.current);
        return;
      }
      onCreated(data as Entry);
      setMessage("");
      setPassword("");
      setDone(true);
    } catch {
      setError("네트워크 오류가 났어요. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="panel-card form">
      <div className="picker">
        <div className="picker__preview" style={{ background: memoHex(color) }} aria-hidden>
          <span className="card__avatar card__avatar--emoji card__avatar--lg">{emoji}</span>
          <div className="picker__preview-text">
            <p className="card__name">{name.trim() || "이름"}</p>
            <p className="picker__preview-msg">{message.trim() || "메시지가 이렇게 보여요."}</p>
          </div>
        </div>

        <fieldset className="picker__group">
          <legend className="field__label">프로필 이모지</legend>
          <div className="emoji-grid" role="radiogroup" aria-label="프로필 이모지">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                role="radio"
                aria-checked={emoji === e}
                aria-label={`이모지 ${e}`}
                className={`emoji-opt ${emoji === e ? "is-on" : ""}`}
                onClick={() => setEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="picker__group">
          <legend className="field__label">메모지 색</legend>
          <div className="swatch-row" role="radiogroup" aria-label="메모지 색">
            {MEMO_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                role="radio"
                aria-checked={color === c.key}
                aria-label={c.label}
                title={c.label}
                className={`swatch ${color === c.key ? "is-on" : ""}`}
                style={{ background: c.hex }}
                onClick={() => setColor(c.key)}
              />
            ))}
          </div>
        </fieldset>
      </div>

      <div className="form__row">
        <label className="field">
          <span className="field__label">이름</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={NAME_MAX}
            required
            placeholder="홍길동"
            autoComplete="nickname"
          />
        </label>
        <label className="field">
          <span className="field__label">비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={PASSWORD_MIN}
            maxLength={PASSWORD_MAX}
            required
            placeholder={`${PASSWORD_MIN}자 이상`}
            autoComplete="new-password"
          />
        </label>
      </div>
      <label className="field">
        <span className="field__label">
          메시지 <em>{message.length}/{MESSAGE_MAX}</em>
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MESSAGE_MAX}
          required
          rows={4}
          placeholder="따뜻한 한마디를 남겨주세요."
        />
      </label>
      <div className="form__foot">
        <p role="status" className={error ? "note note--error" : "note"}>
          {error ?? (done ? "글이 등록됐어요. 아래 방명록에서 확인하세요." : "")}
        </p>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? "남기는 중…" : "남기기"}
        </button>
      </div>
    </form>
  );
}
