# 01: 글 작성 + 최신순 목록

**What to build:** 방문자가 이름·메시지·비밀번호로 글을 남기면 최신순 목록 맨 위에 나타난다. 스키마, db:init, 테스트 하네스가 함께 생긴다.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] entries 스키마, `npm run db:init`
- [ ] 검증(이름·메시지·비밀번호), 공백 정리, 비밀번호는 해시로만 저장
- [ ] `GET/POST /api/entries`, 목록 응답에 해시 없음
- [ ] 화면: 글쓰기 폼 + 목록 + 빈 상태, 개발자 이름·학번 표시
