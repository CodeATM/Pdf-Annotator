"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const LandingNav = () => {
  const navRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY > 50 && !isScrolled) {
        setIsScrolled(true);
        gsap.to(navRef.current, {
          duration: 0.4,
          y: 0,
          opacity: 1,
          ease: "power2.out",
        });
      } else if (scrollY <= 50 && isScrolled) {
        setIsScrolled(false);
        gsap.to(navRef.current, {
          duration: 0.4,
          y: 0,
          opacity: 1,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  // Lock scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen]);

  return (
    <nav
      ref={navRef}
      className={`z-50 transition-all duration-300 ${
        isScrolled
          ? "fixed top-0 left-0 w-full"
          : "absolute top-0 left-0 w-full"
      }`}
    >
      <div
        className={`max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between rounded-xl mt-4 transition-all duration-300 ${
          isScrolled
            ? "bg-white/50 backdrop-blur-md border border-zinc-200 shadow"
            : "bg-white border border-zinc-200"
        } mx-4`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/icons/logo.png"
            alt="Luna Logo"
            width={32}
            height={32}
            className="rounded shadow"
          />
          <span className="text-lg font-bold text-zinc-900">Luna</span>
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-6 text-sm font-medium text-zinc-600">
          <li>
            <a href="#home" className="hover:text-black transition">
              Home
            </a>
          </li>
          <li>
            <a href="#features" className="hover:text-black transition">
              Features
            </a>
          </li>
          <li>
            <a href="#usecases" className="hover:text-black transition">
              Use Cases
            </a>
          </li>
          <li>
            <a href="#testimonials" className="hover:text-black transition">
              Testimonials
            </a>
          </li>
          <li>
            <a href="#contact" className="hover:text-black transition">
              Contact
            </a>
          </li>
        </ul>

        {/* Desktop Auth Actions */}
        <div className="hidden md:flex gap-2 items-center">
          <a
            href="/auth/login"
            className="px-4 py-1.5 rounded-md bg-zinc-100 text-zinc-800 hover:bg-zinc-200 text-sm border border-zinc-300"
          >
            Login
          </a>
          <a
            href="/auth/sign-up"
            className="px-4 py-1.5 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 text-sm font-semibold"
          >
            Get Started
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-zinc-800 p-2"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed top-0 left-0 w-full h-screen bg-white z-[999] flex flex-col items-center justify-center gap-6 text-lg font-medium text-zinc-800 md:hidden px-6 overflow-hidden"
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 right-6 text-zinc-700 hover:text-zinc-900"
            >
              <X className="w-7 h-7" />
            </button>

            <a
              href="#home"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-black"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-black"
            >
              Features
            </a>
            <a
              href="#usecases"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-black"
            >
              Use Cases
            </a>
            <a
              href="#testimonials"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-black"
            >
              Testimonials
            </a>
            <a
              href="#contact"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-black"
            >
              Contact
            </a>

            <a
              href="/auth/login"
              className="mt-6 w-full text-center px-6 py-2 rounded-md bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-300"
            >
              Login
            </a>
            <a
              href="/auth/sign-up"
              className="px-6 py-2 w-full text-center rounded-md bg-zinc-900 text-white hover:bg-zinc-800 font-semibold"
            >
              Get Started
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
