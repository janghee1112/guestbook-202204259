# 02: 비밀번호로 수정·삭제

**What to build:** 글 카드를 눌러 상세 패널에서 비밀번호로 메시지를 수정하거나 글을 삭제한다. 틀리면 거부되고 안내가 뜬다.

**Blocked by:** 01 (글 작성 + 최신순 목록)

**Status:** ready-for-agent

- [ ] 수정: 맞으면 메시지·updated_at 변경, 틀리면 wrong_password, 없으면 not_found
- [ ] 삭제: 맞으면 삭제, 틀리면 wrong_password, 없으면 not_found
- [ ] `PATCH/DELETE /api/entries/[id]` 200/400/403/404
- [ ] 화면: 상세 패널, 수정·삭제(확인 단계), 틀린 비밀번호 안내
