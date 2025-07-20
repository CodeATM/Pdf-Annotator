import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const integrations = [
  { name: "Slack", logo: "/icons/slack.svg" },
  { name: "Dropbox", logo: "/icons/dropbox.svg" },
  { name: "Jira", logo: "/icons/jira.svg" },
  { name: "Google Drive", logo: "/icons/google-drive.svg" },
  { name: "Zoom", logo: "/icons/zoom.svg" },
  { name: "Notion", logo: "/icons/notion.svg" },
  { name: "Trello", logo: "/icons/trello.svg" },
  { name: "Asana", logo: "/icons/asana.svg" },
];

export const LandingIntegrations = () => {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  return (
    <section className="w-full py-20 px-4 bg-white dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-zinc-900">Integrated with tools you love</h2>
        <p className="text-center text-zinc-600 mb-12">Connect Luna PDF with your favorite apps to supercharge your workflow.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6 items-center justify-center">
          {integrations.map((tool, i) => (
            <div
              key={tool.name}
              ref={el => (cardsRef.current[i] = el)}
              className="bg-white/70 backdrop-blur-md rounded-xl shadow border border-zinc-200 flex flex-col items-center justify-center p-4 h-24 transition-transform hover:-translate-y-2 hover:shadow-xl"
            >
              <img src={tool.logo} alt={tool.name} className="h-10 w-auto mb-2 grayscale" />
              <span className="text-xs text-zinc-700 font-medium">{tool.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 