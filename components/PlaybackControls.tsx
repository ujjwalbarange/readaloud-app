"use client";

import React from "react";
import {
  Play,
  Pause,
  Square,
  SkipForward,
  Minus,
  Plus,
  Repeat,
  AlignLeft,
  Infinity,
} from "lucide-react";

interface PlaybackControlsProps {
  wordsPerSet: number;
  repeatCount: number;
  onWordsPerSetChange: (val: number) => void;
  onRepeatCountChange: (val: number) => void;
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext: () => void;
  currentSetIndex: number;
  totalSets: number;
  currentRepeat: number;
  hasWords: boolean;
}

export default function PlaybackControls({
  wordsPerSet,
  repeatCount,
  onWordsPerSetChange,
  onRepeatCountChange,
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onStop,
  onNext,
  currentSetIndex,
  totalSets,
  currentRepeat,
  hasWords,
}: PlaybackControlsProps) {
  return (
    <div className="sticky bottom-0 z-50 animate-slide-up">
      {/* Gradient fade edge */}
      <div className="h-6 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />

      <div className="glass-strong rounded-t-3xl px-4 py-4 sm:px-6 sm:py-5">
        {/* Progress Info */}
        {hasWords && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-xs font-medium text-text-secondary tracking-wide uppercase">
              Set {currentSetIndex + 1} of {totalSets}
            </span>
            <span className="w-1 h-1 rounded-full bg-text-muted" />
            {repeatCount === 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400/90">
                <Infinity className="w-3.5 h-3.5" />
                Manual mode
              </span>
            ) : (
              <span className="text-xs font-medium text-text-secondary">
                Repeat {currentRepeat}/{repeatCount}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* ── Counter: Words Per Set ── */}
          <div className="flex items-center gap-3 bg-surface/60 rounded-2xl px-4 py-2.5">
            <AlignLeft className="w-4 h-4 text-text-secondary shrink-0" />
            <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
              Words
            </span>
            <div className="flex items-center gap-1">
              <button
                id="words-per-set-dec"
                onClick={() => onWordsPerSetChange(Math.max(1, wordsPerSet - 1))}
                className="w-7 h-7 rounded-lg bg-card hover:bg-card-hover flex items-center justify-center
                  text-text-secondary hover:text-white transition-all duration-150 cursor-pointer"
                aria-label="Decrease words per set"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-white tabular-nums">
                {wordsPerSet}
              </span>
              <button
                id="words-per-set-inc"
                onClick={() => onWordsPerSetChange(wordsPerSet + 1)}
                className="w-7 h-7 rounded-lg bg-card hover:bg-card-hover flex items-center justify-center
                  text-text-secondary hover:text-white transition-all duration-150 cursor-pointer"
                aria-label="Increase words per set"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Counter: Repeat Count ── */}
          <div className="flex items-center gap-3 bg-surface/60 rounded-2xl px-4 py-2.5">
            <Repeat className="w-4 h-4 text-text-secondary shrink-0" />
            <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
              Repeat
            </span>
            <div className="flex items-center gap-1">
              <button
                id="repeat-count-dec"
                onClick={() => onRepeatCountChange(Math.max(0, repeatCount - 1))}
                className="w-7 h-7 rounded-lg bg-card hover:bg-card-hover flex items-center justify-center
                  text-text-secondary hover:text-white transition-all duration-150 cursor-pointer"
                aria-label="Decrease repeat count"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-white tabular-nums">
                {repeatCount === 0 ? (
                  <Infinity className="w-4 h-4 mx-auto text-amber-400" />
                ) : (
                  repeatCount
                )}
              </span>
              <button
                id="repeat-count-inc"
                onClick={() => onRepeatCountChange(repeatCount + 1)}
                className="w-7 h-7 rounded-lg bg-card hover:bg-card-hover flex items-center justify-center
                  text-text-secondary hover:text-white transition-all duration-150 cursor-pointer"
                aria-label="Increase repeat count"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Spacer ── */}
          <div className="flex-1" />

          {/* ── Playback Buttons ── */}
          <div className="flex items-center gap-2">
            {/* Stop */}
            <button
              id="stop-btn"
              onClick={onStop}
              disabled={!isPlaying && !isPaused}
              className="w-11 h-11 rounded-full bg-card border border-border-subtle
                flex items-center justify-center
                text-text-secondary hover:text-white hover:border-white/20
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer"
              aria-label="Stop"
            >
              <Square className="w-4 h-4" />
            </button>

            {/* Play / Pause */}
            <button
              id="play-pause-btn"
              onClick={isPlaying && !isPaused ? onPause : onPlay}
              disabled={!hasWords}
              className={`
                w-14 h-14 rounded-full flex items-center justify-center
                transition-all duration-200 cursor-pointer
                disabled:opacity-30 disabled:cursor-not-allowed
                ${
                  isPlaying && !isPaused
                    ? "bg-white text-black hover:bg-gray-200 shadow-[0_0_25px_rgba(255,255,255,0.15)]"
                    : "bg-brand text-black hover:bg-brand-dim hover:scale-105 shadow-[0_0_30px_rgba(30,215,96,0.2)]"
                }
                active:scale-95
              `}
              aria-label={isPlaying && !isPaused ? "Pause" : "Play"}
            >
              {isPlaying && !isPaused ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              id="next-set-btn"
              onClick={onNext}
              disabled={!hasWords}
              className="w-11 h-11 rounded-full bg-card border border-border-subtle
                flex items-center justify-center
                text-text-secondary hover:text-white hover:border-white/20
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer"
              aria-label="Next set"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
