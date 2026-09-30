/** ISO 시각을 한국 시간으로 보여준다(서버·브라우저가 같은 결과를 내도록 시간대 고정). */
export function formatKst(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
