"use client";

import React from "react";
import { LandingNav } from "@/components/landing/Nav";
import { LandingHero } from "@/components/landing/Hero";
import { LandingFeatures } from "@/components/landing/Features";
import { LandingOverview } from "@/components/landing/Stats";
import { VideoShowcase } from "@/components/landing/UseCases";
import { LandingIntegrations } from "@/components/landing/Integrations";
import { LandingTestimonial } from "@/components/landing/Testimonial";
import { LandingNewsletter } from "@/components/landing/Newsletter";
import { LandingCTAAndFooter } from "@/components/landing/Footer";

const Page = () => {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingOverview />
      <VideoShowcase />
      {/* <LandingIntegrations /> */}
      <LandingTestimonial />
      {/* <LandingNewsletter /> */}
      <LandingCTAAndFooter />
    </main>
  );
};

export default Page;
