"use client";

import React, { useEffect, useRef } from "react";

interface TextDisplayProps {
  words: string[];
  currentIndex: number;
  wordsPerSet: number;
  isPlaying: boolean;
  onWordClick: (index: number) => void;
}

export default function TextDisplay({
  words,
  currentIndex,
  wordsPerSet,
  isPlaying,
  onWordClick,
}: TextDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll the active word into view
  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentIndex]);

  if (words.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-surface/50 flex items-center justify-center mb-6">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-text-muted"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-text-secondary">
            No script loaded
          </h3>
          <p className="text-sm text-text-muted max-w-xs mx-auto leading-relaxed">
            Paste your text above and click &quot;Load Script&quot; to begin your dictation session
          </p>
        </div>
      </div>
    );
  }

  const setStart = currentIndex;
  const setEnd = Math.min(currentIndex + wordsPerSet, words.length);

  return (
    <div
      ref={containerRef}
      className="flex-1 py-8 px-2 sm:px-4 overflow-y-auto"
      style={{ paddingBottom: "200px" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap gap-x-[0.35em] gap-y-2 leading-[1.8]">
          {words.map((word, i) => {
            const isActive = i >= setStart && i < setEnd;
            const isPast = i < setStart;

            return (
              <span
                key={i}
                ref={i === setStart ? activeWordRef : undefined}
                onClick={() => onWordClick(i)}
                className={`
                  inline-block cursor-pointer select-none
                  text-2xl sm:text-3xl lg:text-4xl font-medium
                  rounded-lg px-1.5 py-0.5
                  transition-all duration-300 ease-out
                  ${
                    isActive
                      ? "text-brand scale-[1.05] animate-pulse-glow"
                      : isPast
                      ? "text-text-muted/40 hover:text-text-muted/70"
                      : "text-text-muted/50 hover:text-text-secondary/70"
                  }
                  hover:bg-white/[0.03]
                `}
                role="button"
                tabIndex={0}
                aria-label={`Word: ${word}. Click to start reading from here.`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onWordClick(i);
                  }
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
