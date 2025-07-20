import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const LandingCTA = () => {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.2 }
      );
    }
  }, []);

  return (
    <section className="w-full py-16 px-4 flex justify-center items-center bg-zinc-50 dark:bg-zinc-950">
      <div
        ref={ctaRef}
        className="w-full max-w-3xl mx-auto rounded-3xl bg-white/80 backdrop-blur-md shadow-2xl border border-zinc-200 flex flex-col items-center text-center p-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Ready to get started?</h2>
        <p className="text-lg md:text-xl mb-8 text-zinc-600">Sign up now and experience seamless PDF annotation and collaboration.</p>
        <a href="/auth/sign-up" className="inline-block px-8 py-4 rounded-xl bg-zinc-900 text-white font-bold text-lg shadow-lg hover:bg-zinc-800 transition-colors">
          Create Your Free Account
        </a>
      </div>
    </section>
  );
}; 