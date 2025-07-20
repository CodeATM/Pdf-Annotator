"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Twitter, Linkedin, Facebook, Globe } from "lucide-react";
import Image from "next/image";

export const LandingCTAAndFooter = () => {
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
    <>
      {/* CTA */}
      <section className="w-full py-20 px-4 bg-[#181818] text-white flex justify-center items-center">
        <div
          ref={ctaRef}
          className="w-full max-w-4xl mx-auto text-center p-12 border border-zinc-700 rounded-3xl bg-[#1f1f1f]"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg md:text-xl mb-8 text-zinc-400">
            Join thousands of teams using Luna to collaborate smarter on PDFs.
          </p>
          <a
            href="/auth/sign-up"
            className="inline-block px-8 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-colors"
          >
            Create Your Free Account
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#181818] text-zinc-300 py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          {/* Logo + Socials */}
          <div className="flex flex-col items-start gap-4">
            <img src="/icons/logo.png" alt="Company Logo" width={40} height={40} />
            <span className="font-bold text-lg text-white">PDF Annotator</span>
            <div className="flex gap-4">
              <a href="#" aria-label="Twitter"><Twitter className="w-5 h-5 hover:text-white" /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin className="w-5 h-5 hover:text-white" /></a>
              <a href="#" aria-label="Facebook"><Facebook className="w-5 h-5 hover:text-white" /></a>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-12">
            <div>
              <div className="font-semibold text-white mb-2">Company</div>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">About</a></li>
                <li><a href="#" className="hover:underline">Blog</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Press</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-2">Support</div>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Help Center</a></li>
                <li><a href="#" className="hover:underline">API Docs</a></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
                <li><a href="#" className="hover:underline">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-2">Product</div>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Features</a></li>
                <li><a href="#" className="hover:underline">Integrations</a></li>
                <li><a href="#" className="hover:underline">Changelog</a></li>
              </ul>
            </div>
          </div>

          {/* Language & Copyright */}
          <div className="flex flex-col gap-4 text-sm">
            <label className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <select className="bg-transparent border border-zinc-600 px-3 py-1 rounded-md text-white">
                <option>English</option>
                <option>Deutsch</option>
              </select>
            </label>
            <div className="text-zinc-500 text-xs">
              © {new Date().getFullYear()} PDF Annotator. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
