/** 입력 규칙. 서버 검증과 화면 폼이 같은 값을 쓴다. */
export const NAME_MAX = 20;
export const MESSAGE_MAX = 500;
export const PASSWORD_MIN = 4;
export const PASSWORD_MAX = 64;

/** 프로필 이모지 허용 목록. 첫 번째가 기본값. */
export const EMOJIS = ["😀", "😎", "🥳", "🤗", "😴", "🐶", "🐱", "🐻", "🌷", "☕️", "🎧", "🚀"] as const;

/** 메모지 색 허용 목록(DB 에는 key 로 저장). 첫 번째가 기본값. */
export const MEMO_COLORS = [
  { key: "white", label: "화이트", hex: "#FFFFFF" },
  { key: "sky", label: "스카이", hex: "#E8F2FF" },
  { key: "mint", label: "민트", hex: "#E4F6EC" },
  { key: "lemon", label: "레몬", hex: "#FFF6D6" },
  { key: "peach", label: "피치", hex: "#FFEBE3" },
  { key: "lavender", label: "라벤더", hex: "#EFEAFF" },
] as const;

export type MemoColor = (typeof MEMO_COLORS)[number]["key"];

export const DEFAULT_EMOJI = EMOJIS[0];
export const DEFAULT_COLOR: MemoColor = "white";

/** 색 key → 화면 색상값(모르는 값이면 흰색). */
export function memoHex(key: string): string {
  return MEMO_COLORS.find((c) => c.key === key)?.hex ?? "#FFFFFF";
}
