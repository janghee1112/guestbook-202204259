"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion, scrollToId } from "@/lib/motion";

/** 첫 화면. 들어올 때 글자가 차례로 떠오르고, 스크롤하면 작아지며 흐려진다(scrub). */
export default function Hero({ count }: { count: number }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-line]", {
        yPercent: 110,
        opacity: 0,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.12,
      });
      gsap.from("[data-hero-fade]", { opacity: 0, y: 20, duration: 0.9, delay: 0.5, ease: "power3.out", stagger: 0.08 });
      gsap.to("[data-hero-stage]", {
        scale: 0.88,
        opacity: 0.15,
        filter: "blur(6px)",
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="hero">
      <div data-hero-stage className="hero__stage">
        <p data-hero-fade className="eyebrow">Guestbook</p>
        <h1 className="hero__title">
          <span className="line"><span data-hero-line>한 줄,</span></span>
          <span className="line"><span data-hero-line>남기고 가세요.</span></span>
        </h1>
        <p data-hero-fade className="hero__lead">
          로그인은 필요 없어요. 이름과 메시지를 남기고,
          <br className="hide-sm" /> 비밀번호로 내 글만 고치고 지울 수 있어요.
        </p>
        <div data-hero-fade className="hero__actions">
          <button type="button" className="btn btn--primary" onClick={() => scrollToId("write")}>
            글 남기기
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => scrollToId("entries")}>
            {count}개의 글 보기
          </button>
        </div>
      </div>
      <div data-hero-fade className="hero__scroll" aria-hidden>
        <span />
      </div>
    </section>
  );
}
