# Spec: 미니 방명록 (Guestbook)

**Status:** ready-for-agent

## Problem Statement

방문자가 로그인 없이 이름과 메시지를 남기고, 나중에 자기 글만 고치거나 지울 수 있는 간단한 공개 방명록이 필요하다. 다른 사람이 내 글을 바꾸거나 지우면 안 된다.

## Solution

한 페이지짜리 방명록. 이름·메시지·글 비밀번호로 글을 남기면 최신순 목록 맨 위에 나타난다. 글 카드를 누르면 상세 패널이 열리고, 글 비밀번호를 넣어 메시지를 수정하거나 글을 삭제한다. 비밀번호가 틀리면 서버가 거부하고 화면에 안내한다. 화면에 개발자 이름(이장희)과 학번(202204259)을 표시한다.

## User Stories

1. As a 방문자, I want to 이름·메시지·비밀번호를 입력해 글을 남기고 싶다, so that 방명록에 흔적을 남긴다
2. As a 방문자, I want to 빈 이름·빈 메시지·짧은 비밀번호는 저장 전에 이유와 함께 막히길 원한다, so that 무엇을 고칠지 안다
3. As a 방문자, I want to 이름과 메시지 앞뒤 공백이 정리되길 원한다, so that 깔끔하게 보인다
4. As a 방문자, I want to 글을 남기면 목록 맨 위에 바로 보이길 원한다, so that 등록됐는지 안다
5. As a 방문자, I want to 전체 글을 최신 작성순으로 보고 싶다, so that 최근 글부터 읽는다
6. As a 방문자, I want to 각 글의 이름·메시지·작성 시각(한국 시간)을 보고 싶다, so that 누가 언제 썼는지 안다
7. As a 방문자, I want to 글이 없을 때 안내 문구를 보고 싶다, so that 빈 화면에 당황하지 않는다
8. As a 작성자, I want to 내 글을 눌러 상세 패널을 열고 싶다, so that 수정·삭제를 시작한다
9. As a 작성자, I want to 비밀번호를 넣고 메시지를 수정하고 싶다, so that 오타를 고친다
10. As a 작성자, I want to 수정된 글에 "수정됨"이 표시되길 원한다, so that 바뀐 글임을 안다
11. As a 작성자, I want to 비밀번호를 넣고 내 글을 삭제하고 싶다, so that 원치 않는 글을 지운다
12. As a 작성자, I want to 삭제 전에 한 번 더 확인받고 싶다, so that 실수로 지우지 않는다
13. As a 방문자, I want to 비밀번호가 틀리면 수정이 거부되고 "비밀번호가 일치하지 않습니다"를 보고 싶다, so that 남의 글을 고칠 수 없음을 안다
14. As a 방문자, I want to 비밀번호가 틀리면 삭제가 거부되고 같은 안내를 보고 싶다, so that 남의 글을 지울 수 없음을 안다
15. As a 작성자, I want to API를 직접 불러도 비밀번호 없이는 수정·삭제가 안 되길 원한다, so that 내 글이 안전하다
16. As a 방문자, I want to 이미 삭제된 글을 수정·삭제하려 하면 "글을 찾을 수 없습니다"를 보고 싶다, so that 상황을 안다
17. As a 방문자, I want to 비밀번호가 목록이나 응답에 절대 드러나지 않길 원한다, so that 비밀번호가 새지 않는다
18. As a 방문자, I want to 화면에서 개발자 이름과 학번을 보고 싶다, so that 누가 만든 앱인지 안다
19. As a 방문자, I want to 부드러운 스크롤 등장, 카드가 화면으로 빨려 들어가는 상세 전환을 보고 싶다, so that 쓰는 재미가 있다
20. As a 방문자, I want to 모션을 줄이기 설정이면 모션 없이도 똑같이 쓰고 싶다, so that 불편하지 않다

## Implementation Decisions

- 스키마(`db/schema.sql`):
  ```sql
  create table if not exists entries (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    message text not null,
    password_hash text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz
  );
  ```
- 깊은 모듈 하나: 방명록 모듈 — `listEntries`, `createEntry`, `updateEntry`, `deleteEntry`. 검증·해시·SQL을 모두 감춘다. 수정·삭제 결과는 `"ok" | "not_found" | "wrong_password"`.
- 비밀번호: scrypt + 글마다 salt(ADR-0001). 해시는 모듈 밖으로 나가지 않는다.
- 검증: 이름 1~20자, 메시지 1~500자(앞뒤 공백 제거 후), 비밀번호 4~64자.
- API:
  - `GET /api/entries` → 200 `Entry[]` (최신순, 최대 100개)
  - `POST /api/entries` `{ name, message, password }` → 201 `Entry` / 400
  - `PATCH /api/entries/[id]` `{ password, message }` → 200 `Entry` / 400 / 403 / 404
  - `DELETE /api/entries/[id]` `{ password }` → 200 / 403 / 404
  - `Entry = { id, name, message, createdAt, updatedAt }`
- 화면: 한 페이지(요청 시점 렌더링). 히어로 → 글쓰기 카드 → 글 목록. 글 카드 클릭 시 상세 패널(수정·삭제·비밀번호). 모션은 docs/DESIGN.md.

## Testing Decisions

- seam 하나: 방명록 모듈. PGlite에 실제 스키마로 공개 함수만 호출해 반환값 확인.
- 작성·목록(최신순·해시 비노출)·검증 실패·수정 성공/비밀번호 틀림/없는 글·삭제 성공/비밀번호 틀림/없는 글.
- 모션·화면은 브라우저로 수동 확인.

## Out of Scope

- 로그인, 관리자, 페이지 나누기, 이름 수정, 좋아요·댓글, 스팸 방지

## Further Notes

- GitHub 저장소·Vercel·Neon 이름은 모두 `guestbook-202204259`. 저장소는 public.
