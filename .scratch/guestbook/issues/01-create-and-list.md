# 01: 글 작성 + 최신순 목록

**What to build:** 방문자가 이름·메시지·비밀번호로 글을 남기면 최신순 목록 맨 위에 나타난다. 스키마, db:init, 테스트 하네스가 함께 생긴다.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] entries 스키마, `npm run db:init`
- [x] 검증(이름·메시지·비밀번호), 공백 정리, 비밀번호는 해시로만 저장
- [x] `GET/POST /api/entries`, 목록 응답에 해시 없음
- [x] 화면: 글쓰기 폼 + 목록 + 빈 상태, 개발자 이름·학번 표시

## Comments

- 구현 완료. npm test 17개 통과, API 스모크(201/400/403/404) 통과, 데스크톱·모바일(375px) 스크린샷 확인.
