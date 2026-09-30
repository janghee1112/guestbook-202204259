"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { prefersReducedMotion, setLenis } from "@/lib/motion";

/** Lenis 관성 스크롤 + GSAP ScrollTrigger 동기화. 터치 기기·모션 줄이기에서는 끈다. */
export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (prefersReducedMotion() || matchMedia("(hover: none)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);
  return null;
}
