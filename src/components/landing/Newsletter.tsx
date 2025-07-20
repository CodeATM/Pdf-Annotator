"use client";
import { motion } from "framer-motion";

export const LandingNewsletter = () => (
  <section className="py-16 px-4 bg-gradient-to-br from-indigo-50 to-white dark:from-zinc-900 dark:to-zinc-950">
    <div className="max-w-xl mx-auto text-center">
      <motion.h2
        className="text-2xl md:text-3xl font-bold mb-4 text-zinc-900 dark:text-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Keep up with the latest
      </motion.h2>
      <motion.form
        className="flex flex-col sm:flex-row gap-4 justify-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onSubmit={e => e.preventDefault()}
      >
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 px-4 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-purple-600 transition"
        >
          Subscribe
        </button>
      </motion.form>
    </div>
  </section>
); 