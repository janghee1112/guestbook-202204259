# 03: 애플 스타일 디자인 + 모션

**What to build:** docs/DESIGN.md 대로 흰 배경 애플 스타일을 입히고, 부드러운 스크롤·스크롤 등장·히어로 scrub·카드가 빨려 들어가는 상세 전환·작은 상호작용을 넣는다.

**Blocked by:** 02 (비밀번호로 수정·삭제)

**Status:** ready-for-agent

- [x] 모션 1~5 동작, reduced-motion 대응
- [x] 모바일 375px 깨짐 없음, 빌드 성공

## Comments

- 구현 완료. npm test 17개 통과, API 스모크(201/400/403/404) 통과, 데스크톱·모바일(375px) 스크린샷 확인.
