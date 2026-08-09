"use client";

import React, { useEffect, useRef } from "react";

interface TextDisplayProps {
  words: string[];
  paragraphs: string[][];
  activeSetStart: number;
  activeSetEnd: number;
  speakingWordIdx: number;
  isPlaying: boolean;
  onWordClick: (index: number) => void;
}

export default function TextDisplay({
  words,
  paragraphs,
  activeSetStart,
  activeSetEnd,
  speakingWordIdx,
  isPlaying,
  onWordClick,
}: TextDisplayProps) {
  const activeWordRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll the currently speaking word into view
  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [speakingWordIdx, activeSetStart]);

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

  // Initialize a tracker to maintain the flat index across all paragraphs
  let globalIdx = 0;

  return (
    <div
      className="flex-1 py-8 px-2 sm:px-4 overflow-y-auto"
      style={{ paddingBottom: "220px" }}
    >
      <div className="max-w-3xl mx-auto">
        {paragraphs.map((para, pIdx) => (
          <div key={pIdx} className="mb-6 flex flex-wrap gap-x-[0.35em] gap-y-2 leading-[1.8]">
            {para.map((word, wIdx) => {
              // Capture the current global index and increment for the next word
              const i = globalIdx++;
              
              const isSpeaking = speakingWordIdx === i;
              const isInActiveSet = i >= activeSetStart && i < activeSetEnd;
              const isPast = i < activeSetStart;

              // Determine ref target: attach to the speaking word, or the set start
              const isRefTarget = isSpeaking || (speakingWordIdx === -1 && i === activeSetStart);

              let colorClass: string;
              if (isSpeaking) {
                colorClass = "text-brand scale-[1.08] animate-pulse-glow";
              } else if (isInActiveSet) {
                colorClass = "text-brand/70 scale-[1.02]";
              } else if (isPast) {
                colorClass = "text-text-muted/30 hover:text-text-muted/60";
              } else {
                colorClass = "text-text-muted/50 hover:text-text-secondary/70";
              }

              return (
                <span
                  key={i}
                  ref={isRefTarget ? activeWordRef : undefined}
                  onClick={() => onWordClick(i)}
                  className={`
                    inline-block cursor-pointer select-none
                    text-2xl sm:text-3xl lg:text-4xl font-medium
                    rounded-lg px-1.5 py-0.5
                    transition-all duration-300 ease-out
                    ${colorClass}
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
        ))}
      </div>
    </div>
  );
}
