"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    name: "Emily Clark",
    role: "UX Designer",
    company: "PixelPro",
    photo: "https://randomuser.me/api/portraits/women/21.jpg",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
    review:
      "The intuitive interface and seamless collaboration tools make reviewing documents a breeze. Our design reviews are now faster and more efficient.",
  },
  {
    name: "Liam Johnson",
    role: "Product Manager",
    company: "Workflow Inc.",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Trello-logo-blue.svg",
    review:
      "We've streamlined our entire document feedback process. Luna has become an essential part of our product cycles.",
  },
  {
    name: "Sophia Lee",
    role: "Legal Advisor",
    company: "LexCorp",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Microsoft_Office_logo_%282019%E2%80%93present%29.svg",
    review:
      "It’s the best tool for collaborative legal document editing I’ve used so far. Clear annotations and secure access have been game changers.",
  },
  {
    name: "Noah Bennett",
    role: "Professor",
    company: "Modern University",
    photo: "https://randomuser.me/api/portraits/men/53.jpg",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Forms_logo.svg",
    review:
      "Luna helped me engage my students with annotated lecture notes and collaborative study guides. Teaching has never been this interactive!",
  },
  {
    name: "Ava Martinez",
    role: "Research Analyst",
    company: "DataScope",
    photo: "https://randomuser.me/api/portraits/women/67.jpg",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Tableau_Logo.png",
    review:
      "We use Luna to mark up white papers and research findings in real-time. It keeps the whole team aligned.",
  },
  {
    name: "Jackson Lee",
    role: "Creative Director",
    company: "Storyboard Studio",
    photo: "https://randomuser.me/api/portraits/men/68.jpg",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
    review:
      "Perfect for review cycles! The drawing and highlighting tools give our creative team the flexibility we need.",
  },
];

export const LandingTestimonial = () => {
  const [index, setIndex] = useState(0);
  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-20 px-4 bg-white dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-12">
          What Our Users Are Saying
        </h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.slice(index, index + 3).map((t, i) => (
              <div
                key={t.name}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col items-center text-center"
              >
                <img
                  src={t.photo}
                  alt={t.name}
                  width={64}
                  height={64}
                  className="rounded-full mb-4"
                />
                <p className="text-sm text-zinc-600 dark:text-zinc-300 italic mb-4">
                  "{t.review}"
                </p>
                <div className="flex flex-col items-center gap-2">
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {t.name}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {t.role} @ {t.company}
                  </span>

                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-6 mt-10">
          <button
            onClick={prev}
            className="w-10 h-10 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Previous"
          >
            ←
          </button>
          <button
            onClick={next}
            className="w-10 h-10 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Next"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
};
