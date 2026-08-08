"use client";

import React from "react";
import {
  Play,
  Square,
  SkipForward,
  RotateCcw,
  Minus,
  Plus,
  Repeat,
  AlignLeft,
  Infinity,
  Timer,
  Clock,
} from "lucide-react";

interface PlaybackControlsProps {
  wordsPerSet: number;
  repeatCount: number;
  wordDelay: number;
  setDelay: number;
  onWordsPerSetChange: (val: number) => void;
  onRepeatCountChange: (val: number) => void;
  onWordDelayChange: (val: number) => void;
  onSetDelayChange: (val: number) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  onRepeat: () => void;
  onNext: () => void;
  currentSetIndex: number;
  totalSets: number;
  currentRepeat: number;
  hasWords: boolean;
}

export default function PlaybackControls({
  wordsPerSet,
  repeatCount,
  wordDelay,
  setDelay,
  onWordsPerSetChange,
  onRepeatCountChange,
  onWordDelayChange,
  onSetDelayChange,
  isPlaying,
  onPlay,
  onStop,
  onRepeat,
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

        {/* Controls Row */}
        <div className="flex flex-col gap-4">
          {/* Counters — 2x2 grid on mobile, inline on desktop */}
          <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 sm:gap-3">
            {/* ── Counter: Words Per Set ── */}
            <div className="flex items-center gap-2 bg-surface/60 rounded-2xl px-3 py-2.5 sm:px-4">
              <AlignLeft className="w-4 h-4 text-text-secondary shrink-0" />
              <span className="text-[11px] font-medium text-text-secondary whitespace-nowrap">
                Words
              </span>
              <div className="flex items-center gap-1 ml-auto sm:ml-0">
                <button
                  id="words-per-set-dec"
                  onClick={() => onWordsPerSetChange(Math.max(1, wordsPerSet - 1))}
                  className="w-7 h-7 rounded-lg bg-card hover:bg-card-hover flex items-center justify-center
                    text-text-secondary hover:text-white transition-all duration-150 cursor-pointer"
                  aria-label="Decrease words per set"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center text-sm font-bold text-white tabular-nums">
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
            <div className="flex items-center gap-2 bg-surface/60 rounded-2xl px-3 py-2.5 sm:px-4">
              <Repeat className="w-4 h-4 text-text-secondary shrink-0" />
              <span className="text-[11px] font-medium text-text-secondary whitespace-nowrap">
                Repeat
              </span>
              <div className="flex items-center gap-1 ml-auto sm:ml-0">
                <button
                  id="repeat-count-dec"
                  onClick={() => onRepeatCountChange(Math.max(0, repeatCount - 1))}
                  className="w-7 h-7 rounded-lg bg-card hover:bg-card-hover flex items-center justify-center
                    text-text-secondary hover:text-white transition-all duration-150 cursor-pointer"
                  aria-label="Decrease repeat count"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center text-sm font-bold text-white tabular-nums">
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

            {/* ── Counter: Word Delay ── */}
            <div className="flex items-center gap-2 bg-surface/60 rounded-2xl px-3 py-2.5 sm:px-4">
              <Timer className="w-4 h-4 text-text-secondary shrink-0" />
              <span className="text-[11px] font-medium text-text-secondary whitespace-nowrap">
                Word&nbsp;Gap
              </span>
              <div className="flex items-center gap-1 ml-auto sm:ml-0">
                <button
                  id="word-delay-dec"
                  onClick={() => onWordDelayChange(Math.max(0, +(wordDelay - 0.5).toFixed(1)))}
                  className="w-7 h-7 rounded-lg bg-card hover:bg-card-hover flex items-center justify-center
                    text-text-secondary hover:text-white transition-all duration-150 cursor-pointer"
                  aria-label="Decrease word delay"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center text-xs font-bold text-white tabular-nums">
                  {wordDelay.toFixed(1)}s
                </span>
                <button
                  id="word-delay-inc"
                  onClick={() => onWordDelayChange(+(wordDelay + 0.5).toFixed(1))}
                  className="w-7 h-7 rounded-lg bg-card hover:bg-card-hover flex items-center justify-center
                    text-text-secondary hover:text-white transition-all duration-150 cursor-pointer"
                  aria-label="Increase word delay"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Counter: Set Delay ── */}
            <div className="flex items-center gap-2 bg-surface/60 rounded-2xl px-3 py-2.5 sm:px-4">
              <Clock className="w-4 h-4 text-text-secondary shrink-0" />
              <span className="text-[11px] font-medium text-text-secondary whitespace-nowrap">
                Set&nbsp;Gap
              </span>
              <div className="flex items-center gap-1 ml-auto sm:ml-0">
                <button
                  id="set-delay-dec"
                  onClick={() => onSetDelayChange(Math.max(0, +(setDelay - 0.5).toFixed(1)))}
                  className="w-7 h-7 rounded-lg bg-card hover:bg-card-hover flex items-center justify-center
                    text-text-secondary hover:text-white transition-all duration-150 cursor-pointer"
                  aria-label="Decrease set delay"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center text-xs font-bold text-white tabular-nums">
                  {setDelay.toFixed(1)}s
                </span>
                <button
                  id="set-delay-inc"
                  onClick={() => onSetDelayChange(+(setDelay + 0.5).toFixed(1))}
                  className="w-7 h-7 rounded-lg bg-card hover:bg-card-hover flex items-center justify-center
                    text-text-secondary hover:text-white transition-all duration-150 cursor-pointer"
                  aria-label="Increase set delay"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Spacer (desktop only) ── */}
            <div className="hidden sm:block flex-1" />
          </div>

          {/* ── Playback Buttons ── */}
          <div className="flex items-center justify-center sm:justify-end gap-2">
            {/* Stop */}
            <button
              id="stop-btn"
              onClick={onStop}
              disabled={!isPlaying}
              className="w-11 h-11 rounded-full bg-card border border-border-subtle
                flex items-center justify-center
                text-text-secondary hover:text-white hover:border-white/20
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer"
              aria-label="Stop"
            >
              <Square className="w-4 h-4" />
            </button>

            {/* Play */}
            <button
              id="play-btn"
              onClick={onPlay}
              disabled={!hasWords}
              className={`
                w-14 h-14 rounded-full flex items-center justify-center
                transition-all duration-200 cursor-pointer
                disabled:opacity-30 disabled:cursor-not-allowed
                ${
                  isPlaying
                    ? "bg-brand text-black shadow-[0_0_30px_rgba(30,215,96,0.25)] animate-pulse"
                    : "bg-brand text-black hover:bg-brand-dim hover:scale-105 shadow-[0_0_30px_rgba(30,215,96,0.2)]"
                }
                active:scale-95
              `}
              aria-label="Play"
            >
              <Play className="w-6 h-6 ml-0.5" />
            </button>

            {/* Repeat (replays current set) */}
            <button
              id="repeat-btn"
              onClick={onRepeat}
              disabled={!hasWords}
              className="w-11 h-11 rounded-full bg-card border border-border-subtle
                flex items-center justify-center
                text-text-secondary hover:text-brand hover:border-brand/30
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer"
              aria-label="Repeat current set"
            >
              <RotateCcw className="w-4 h-4" />
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
