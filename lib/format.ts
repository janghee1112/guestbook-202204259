const KST_OFFSET_MS = 9 * 60 * 60 * 1000; // 한국은 서머타임이 없어 항상 UTC+9

/**
 * ISO 시각을 "2026년 9월 30일 오후 03:28" 형태의 한국 시간으로 만든다.
 * Intl 은 서버(Node ICU)와 브라우저 결과가 달라 하이드레이션 불일치가 날 수 있어 직접 계산한다.
 */
export function formatKst(iso: string): string {
  const d = new Date(new Date(iso).getTime() + KST_OFFSET_MS);
  const hour = d.getUTCHours();
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${hour < 12 ? "오전" : "오후"} ${pad(h12)}:${pad(d.getUTCMinutes())}`;
}
