"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export const VideoShowcase = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="relative w-full py-24 px-6 bg-white dark:bg-zinc-950"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Headings */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4"
          >
            Watch Luna in Action
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto"
          >
            Discover how modern teams collaborate on PDFs in real time with powerful annotation features and integrations.
          </motion.p>
          <motion.a
            href="/auth/sign-up"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mt-6 px-6 py-3 bg-zinc-900 text-white font-semibold rounded-lg shadow hover:bg-zinc-800 transition"
          >
            Get Started Free
          </motion.a>
        </div>

        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="overflow-hidden rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800"
        >
          <video
            className="w-full h-auto object-cover aspect-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source
              src="/video-url.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </motion.div>
      </div>
    </section>
  );
};
