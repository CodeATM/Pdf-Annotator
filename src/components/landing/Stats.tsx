"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";

const integrations = [
  { name: "Slack", logo: "https://cdn.simpleicons.org/slack/ffffff" },
  { name: "Dropbox", logo: "https://cdn.simpleicons.org/dropbox/ffffff" },
  { name: "Jira", logo: "https://cdn.simpleicons.org/jira/ffffff" },
  {
    name: "Google Drive",
    logo: "https://cdn.simpleicons.org/googledrive/ffffff",
  },
  { name: "Zoom", logo: "https://cdn.simpleicons.org/zoom/ffffff" },
  { name: "Notion", logo: "https://cdn.simpleicons.org/notion/ffffff" },
  { name: "Trello", logo: "https://cdn.simpleicons.org/trello/ffffff" },
  { name: "Asana", logo: "https://cdn.simpleicons.org/asana/ffffff" },
];

// Stats
const stats = [
  { label: "PDFs Annotated", value: 120000, display: "120K+" },
  { label: "Faster Review Cycles", value: 98, display: "98%" },
  { label: "Teams Onboarded", value: 40, display: "40+" },
];

// CountUp logic
function CountUp({ end, display }: { end: number; display: string }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { threshold: 0.6 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView) {
      const duration = 1200;
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
        else setCount(end);
      };
      requestAnimationFrame(animate);
    }
  }, [inView, end]);

  let shown = display;
  if (end < 1000) shown = `${count}${display.replace(/\d+/, "")}`;
  else shown = count >= end ? display : `${Math.floor(count / 1000)}K+`;

  return <span ref={ref}>{shown}</span>;
}

export const LandingOverview = () => {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.3,
      }
    );
  }, []);

  return (
    <section className="bg-[#181818] py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              className="bg-white/5 border border-zinc-700 rounded-xl px-6 py-10 flex flex-col items-center hover:bg-white/10 transition-colors"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <span className="text-4xl md:text-5xl font-extrabold text-white mb-2">
                <CountUp end={stat.value} display={stat.display} />
              </span>
              <span className="text-zinc-400 text-lg font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Integrations */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Integrated with tools you love
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-zinc-400 max-w-xl mx-auto mb-10"
          >
            Supercharge your PDF collaboration by plugging into your team’s
            existing toolkit.
          </motion.p>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6 items-center justify-center max-w-5xl mx-auto">
            {integrations.map((tool, i) => (
              <div
                key={tool.name}
                ref={(el) => (cardsRef.current[i] = el)}
                className="bg-white/5 rounded-xl border border-zinc-700 p-4 h-24 flex flex-col items-center justify-center hover:bg-white/10 transition-all duration-300"
              >
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="h-12 w-auto mb-2 grayscale brightness-150 object-contain"
                  loading="lazy"
                />
                <span className="text-xs text-zinc-300 font-medium">
                  {tool.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
