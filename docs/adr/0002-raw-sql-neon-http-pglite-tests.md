# ORM 없이 Neon HTTP 드라이버로 SQL을 쓰고, 테스트는 PGlite로 같은 SQL을 돌린다

DB 접근은 `query(text, params) → rows` 하나만 가진 작은 인터페이스 뒤에 두고, 운영은 `@neondatabase/serverless`, 테스트는 인메모리 Postgres(PGlite)에 연결한다. 테스트가 네트워크·Neon 없이 실제 SQL을 검증할 수 있어서, 시험 시간 안에 CRUD와 비밀번호 확인을 빠르게 확정할 수 있다.
