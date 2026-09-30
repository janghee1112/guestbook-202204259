import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

/** 틀렸을 때 요소를 좌우로 짧게 흔든다. */
export function shake(el: Element | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(el, { x: 0 }, { keyframes: { x: [-10, 10, -7, 7, -3, 0] }, duration: 0.45, ease: "power2.out" });
}
