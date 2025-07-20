"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import Link from "next/link";
import { useLayoutEffect } from "react";

export const LandingHero = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(
      textRef.current,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    ).fromTo(
      imageRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" },
      "-=0.6"
    );
  }, []);

  return (
    <section className="w-full min-h-screen bg-white flex flex-col items-center justify-start pt-36 pb-16 px-6 sm:px-12 lg:px-24 text-center">
      {/* Text Section */}
      <div className="max-w-4xl mb-2" ref={textRef}>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-5xl font-extrabold text-zinc-900 leading-tight mb-6"
        >
          Turn PDFs into Interactive Workspaces
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-lg sm:text-xl text-zinc-600 mb-8"
        >
          Luna lets you highlight, comment, and collaborate on any document in
          real-time — saving hours of feedback and review time.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/auth/sign-up"
            className="px-6 py-3 rounded-lg bg-zinc-900 text-white font-semibold shadow hover:bg-zinc-800 transition-colors"
          >
            Try Free for 14 Days
          </Link>
          <Link
            href="/#demo"
            className="px-6 py-3 rounded-lg bg-zinc-100 text-zinc-800 font-semibold shadow hover:bg-zinc-200 border border-zinc-200"
          >
            Watch Demo
          </Link>
        </motion.div>
      </div>

      {/* Image Section */}
      <div ref={imageRef} className="w-full max-w-3xl">
        <motion.img
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          src="/landing/At the office-pana.svg"
          alt="PDF Annotation Illustration"
          className="w-full h-auto"
        />
      </div>

      <LogoMarquee />
    </section>
  );
};





const logoUrls = [
  "https://cdn.simpleicons.org/google/000000",
  "https://cdn.simpleicons.org/dropbox/000000",
  "https://cdn.simpleicons.org/slack/000000",
  "https://cdn.simpleicons.org/notion/000000",
  "https://cdn.simpleicons.org/atlassian/000000",
  "https://cdn.simpleicons.org/intercom/000000",
  "https://cdn.simpleicons.org/figma/000000",
  "https://cdn.simpleicons.org/github/000000",
  "https://logo.clearbit.com/linear.app",
  "https://cdn.simpleicons.org/zoom/000000",
];

export const LogoMarquee = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const track = marqueeRef.current?.querySelector(".marquee-track");

      if (track) {
        gsap.to(track, {
          xPercent: -50,
          duration: 30,
          ease: "none",
          repeat: -1,
          scrollTrigger: {
            trigger: marqueeRef.current,
            start: "top bottom", // when the top of the marquee hits bottom of viewport
            end: "bottom top",   // when bottom of marquee hits top of viewport
            toggleActions: "play pause resume pause",
            scrub: false,
          },
        });
      }
    }, marqueeRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative w-full overflow-hidden py-10 bg-white" ref={marqueeRef}>
      {/* Subtitle */}
      <h3 className="text-center text-sm text-zinc-500 uppercase font-medium mb-6">
        Trusted by teams that move fast
      </h3>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Marquee track */}
      <div className="marquee-track whitespace-nowrap flex items-center">
        {[...logoUrls, ...logoUrls].map((url, i) => (
          <img
            key={i}
            src={url}
            alt="Company logo"
            className="mx-8 h-8 opacity-70 grayscale hover:opacity-100 transition duration-300"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
};
