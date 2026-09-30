# Spec: 프로필 이모지 + 메모지 색

**Status:** ready-for-agent

## Problem Statement

모든 글 카드가 이름 첫 글자와 흰 배경으로 똑같아 보여서, 방명록 벽이 단조롭고 누가 쓴 글인지 한눈에 구분하기 어렵다.

## Solution

글을 쓰기 전에 프로필 이모지 12개 중 하나와 메모지 색 6개 중 하나를 고른다. 고르는 즉시 미리보기 카드에 반영되고, 등록된 글 카드와 상세 패널이 그 이모지·색으로 보인다.

## User Stories

1. As a 방문자, I want to 글쓰기 폼에서 이모지 12개 중 하나를 고르고 싶다, so that 내 글에 개성을 준다
2. As a 방문자, I want to 메모지 색 6개 중 하나를 고르고 싶다, so that 내 글이 눈에 띈다
3. As a 방문자, I want to 고르는 즉시 미리보기로 보고 싶다, so that 결과를 예상한다
4. As a 방문자, I want to 고르지 않으면 기본값(😀, 흰색)으로 쓰이길 원한다, so that 선택이 부담스럽지 않다
5. As a 방문자, I want to 목록 카드와 상세 패널이 내가 고른 이모지·색으로 보이길 원한다, so that 내 글을 알아본다
6. As a 방문자, I want to 이 기능 전에 쓴 글도 기본값으로 문제없이 보이길 원한다, so that 기존 글이 깨지지 않는다
7. As a 작성자, I want to API로 목록에 없는 이모지·색을 보내면 거부되길 원한다, so that 화면이 이상한 값으로 깨지지 않는다

## Implementation Decisions

- 스키마 마이그레이션(뒤로 호환): `alter table entries add column if not exists emoji text not null default '😀'`, `color text not null default 'white'`. 기존 코드는 이 열을 몰라도 동작하므로 **DB 마이그레이션을 먼저 적용한 뒤 새 코드를 배포**한다.
- 허용 목록은 입력 규칙 모듈 하나에 둔다(서버 검증·폼 공유). 이모지 12개, 색 키 6개(white/sky/mint/lemon/peach/lavender). 색은 키로 저장하고 화면에서 색상값으로 바꾼다.
- `createEntry` 입력에 선택값 `emoji`, `color`. 없으면 기본값, 목록 밖이면 ValidationError. `Entry`에 `emoji`, `color` 추가. 수정은 기존대로 메시지만.

## Testing Decisions

- seam은 기존 방명록 모듈. 저장·기본값·거부·목록 반환을 공개 함수로 확인.

## Out of Scope

- 이모지·색 수정, 사용자 정의 색, 이미지 업로드
