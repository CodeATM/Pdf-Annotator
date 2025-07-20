"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Users2,
  PenLine,
  Clock3,
  LockKeyhole,
  FileCheck2,
  Share2,
} from "lucide-react";

const features = [
  {
    icon: Users2,
    title: "Live Team Review",
    desc: "Collaborate with your team in real-time on any PDF. Leave feedback, resolve comments, and ship faster.",
    illustration: "/landing/Live collaboration-pana.svg",
  },
  {
    icon: PenLine,
    title: "Smart Annotations",
    desc: "Highlight, underline, draw, and comment with precision. Designed for focused review sessions.",
    illustration: "/landing/Startup life-pana.svg",
  },
  {
    icon: Clock3,
    title: "Activity Timeline",
    desc: "Track every update on your PDFs with a full version timeline and contributor logs.",
    illustration: "/landing/Timeline-bro.svg",
  },
  {
    icon: LockKeyhole,
    title: "Granular Permissions",
    desc: "Invite users as viewers or editors. Set file-level security and revoke access anytime.",
    illustration: "/landing/Secure login-rafiki.svg",
  },
  {
    icon: FileCheck2,
    title: "Document Statuses",
    desc: "Mark documents as Draft, In Review, or Finalized. Keep your team aligned and up-to-date.",
    illustration: "/landing/1.svg",
  },
  {
    icon: Share2,
    title: "Quick Link Sharing",
    desc: "Copy & share documents instantly with trackable short links and optional passwords.",
    illustration: "/landing/2.svg",
  },
];

export const LandingFeatures = () => (
  <section className="py-24 px-6 sm:px-12 bg-white dark:bg-zinc-950">
    {/* Section heading */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto text-center mb-16"
    >
      <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white">
        Everything You Need to Power Teamwork
      </h2>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        We crafted Luna with collaboration-first features designed for growing teams working on documents, contracts, research, and more.
      </p>
    </motion.div>

    {/* Features Grid */}
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, i) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.title}
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 
              flex flex-col justify-between p-6 h-[450px]"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <Icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>

            <div className=" flex justify-center">
              <img
                src={feature.illustration}
                alt={`${feature.title} illustration`}
                className="object-contain max-h-[250px] w-auto mx-auto"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  </section>
);
