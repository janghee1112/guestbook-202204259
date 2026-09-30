# Guestbook — 미니 방명록

개발자: **이장희** (학번 202204259, 강남대학교 AI전공)

로그인 없이 이름·메시지·비밀번호로 글을 남기고, 글 비밀번호로 내 글만 수정·삭제하는 방명록.
Next.js(App Router) + TypeScript + Route Handlers + Neon Postgres(SQL 직접) + Vercel. 모션: GSAP ScrollTrigger + Lenis.

## 실행

https://guestbook-202204259.vercel.app

## API

| 메서드 | 경로 | body | 응답 |
| --- | --- | --- | --- |
| GET | /api/entries | – | 200 글 목록(최신순) |
| POST | /api/entries | `{ name, message, password }` | 201 / 400 |
| PATCH | /api/entries/[id] | `{ password, message }` | 200 / 400 / 403(비밀번호 불일치) / 404 |
| DELETE | /api/entries/[id] | `{ password }` | 200 / 403(비밀번호 불일치) / 404 |

## 문서

- 용어집 `CONTEXT.md`, 결정 기록 `docs/adr/`, 디자인·모션 `docs/DESIGN.md`
- 스펙·티켓 `.scratch/guestbook/`
