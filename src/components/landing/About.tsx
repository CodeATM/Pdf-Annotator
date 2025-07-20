import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const LandingAbout = () => {
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aboutRef.current) {
      gsap.fromTo(
        aboutRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.2 }
      );
    }
  }, []);

  return (
    <section id="features" className="w-full py-20 px-4 bg-white dark:bg-zinc-900">
      <div ref={aboutRef} className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Why Luna PDF?</h2>
          <p className="text-lg text-zinc-600 mb-6">
            Luna PDF is your all-in-one solution for annotating, sharing, and collaborating on PDF documents. Whether you're a student, professional, or team, Luna PDF streamlines your workflow with intuitive tools and real-time sync.
          </p>
          <ul className="space-y-3 text-zinc-700">
            <li>• Highlight, underline, and comment on any PDF</li>
            <li>• Secure cloud storage and instant sharing</li>
            <li>• Real-time collaboration with teammates</li>
            <li>• Works on any device, anywhere</li>
          </ul>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="w-64 h-64 rounded-2xl bg-white/70 backdrop-blur-md shadow-xl border border-zinc-200 flex items-center justify-center">
            <svg width="80" height="80" fill="none" viewBox="0 0 80 80">
              <rect x="10" y="10" width="60" height="60" rx="16" fill="#18181b" />
              <rect x="22" y="22" width="36" height="36" rx="8" fill="#a1a1aa" />
              <rect x="30" y="30" width="20" height="20" rx="4" fill="#fff" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}; 