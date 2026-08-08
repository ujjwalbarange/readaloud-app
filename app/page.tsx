"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Volume2 } from "lucide-react";
import ScriptInput from "@/components/ScriptInput";
import PlaybackControls from "@/components/PlaybackControls";
import TextDisplay from "@/components/TextDisplay";

export default function HomePage() {
  // ── State ──
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordsPerSet, setWordsPerSet] = useState(5);
  const [repeatCount, setRepeatCount] = useState(1);
  const [delay, setDelay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentRepeatDisplay, setCurrentRepeatDisplay] = useState(0);

  // ── Refs (stale-closure safe for Web Speech API callbacks) ──
  const currentIndexRef = useRef(0);
  const wordsPerSetRef = useRef(5);
  const repeatCountRef = useRef(1);
  const currentRepeatRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const wordsRef = useRef<string[]>([]);
  const delayRef = useRef(0);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sync refs with state ──
  useEffect(() => { wordsPerSetRef.current = wordsPerSet; }, [wordsPerSet]);
  useEffect(() => { repeatCountRef.current = repeatCount; }, [repeatCount]);
  useEffect(() => { wordsRef.current = words; }, [words]);
  useEffect(() => { delayRef.current = delay; }, [delay]);

  // ── Computed ──
  const totalSets = words.length > 0 ? Math.ceil(words.length / wordsPerSet) : 0;
  const currentSetIndex = words.length > 0 ? Math.floor(currentIndex / wordsPerSet) : 0;

  // ── Speech Engine ──
  const speakCurrentSet = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Always cancel before speaking to prevent queue build-up
    window.speechSynthesis.cancel();

    const idx = currentIndexRef.current;
    const wps = wordsPerSetRef.current;
    const allWords = wordsRef.current;

    if (idx >= allWords.length) {
      // Reached the end of all words
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsPaused(false);
      isPausedRef.current = false;
      return;
    }

    const setEnd = Math.min(idx + wps, allWords.length);
    const textToSpeak = allWords.slice(idx, setEnd).join(" ");

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      // Guard: if playback was stopped while speaking, don't continue
      if (!isPlayingRef.current) return;

      const rc = repeatCountRef.current;
      const currentRep = currentRepeatRef.current;
      const delayMs = delayRef.current * 1000;

      // Helper to run the next speech action after the configured delay
      const scheduleNext = (action: () => void) => {
        if (delayMs > 0) {
          delayTimerRef.current = setTimeout(action, delayMs);
        } else {
          action();
        }
      };

      if (rc === 0) {
        // ── Rule A: Manual mode ──
        // Spoke once, now stop and wait for manual "Next"
        isPlayingRef.current = false;
        setIsPlaying(false);
        setIsPaused(false);
        isPausedRef.current = false;
        return;
      }

      // ── Rule B: Auto-repeat mode ──
      if (currentRep < rc) {
        // Still have repeats left
        currentRepeatRef.current = currentRep + 1;
        setCurrentRepeatDisplay(currentRep + 1);
        scheduleNext(() => speakCurrentSet());
      } else {
        // All repeats done → advance to next set
        const nextIndex = currentIndexRef.current + wordsPerSetRef.current;

        if (nextIndex >= wordsRef.current.length) {
          // Reached the very end
          isPlayingRef.current = false;
          setIsPlaying(false);
          setIsPaused(false);
          isPausedRef.current = false;
          setCurrentIndex(0);
          currentIndexRef.current = 0;
          return;
        }

        currentIndexRef.current = nextIndex;
        setCurrentIndex(nextIndex);
        currentRepeatRef.current = 0;
        setCurrentRepeatDisplay(0);
        scheduleNext(() => speakCurrentSet());
      }
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // ── Handlers ──
  const handleLoadScript = useCallback((loadedWords: string[]) => {
    if (delayTimerRef.current) { clearTimeout(delayTimerRef.current); delayTimerRef.current = null; }
    setWords(loadedWords);
    wordsRef.current = loadedWords;
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    currentRepeatRef.current = 0;
    setCurrentRepeatDisplay(0);
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    window.speechSynthesis?.cancel();
  }, []);

  const handleClear = useCallback(() => {
    if (delayTimerRef.current) { clearTimeout(delayTimerRef.current); delayTimerRef.current = null; }
    window.speechSynthesis?.cancel();
    setWords([]);
    wordsRef.current = [];
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    currentRepeatRef.current = 0;
    setCurrentRepeatDisplay(0);
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
  }, []);

  const handlePlay = useCallback(() => {
    if (words.length === 0) return;

    if (isPausedRef.current) {
      // Resume from pause
      window.speechSynthesis?.resume();
      setIsPaused(false);
      isPausedRef.current = false;
      setIsPlaying(true);
      isPlayingRef.current = true;
      return;
    }

    // Fresh play
    setIsPlaying(true);
    isPlayingRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;
    currentRepeatRef.current = 0;
    setCurrentRepeatDisplay(0);
    speakCurrentSet();
  }, [words.length, speakCurrentSet]);

  const handlePause = useCallback(() => {
    window.speechSynthesis?.pause();
    setIsPaused(true);
    isPausedRef.current = true;
  }, []);

  const handleStop = useCallback(() => {
    if (delayTimerRef.current) { clearTimeout(delayTimerRef.current); delayTimerRef.current = null; }
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    currentRepeatRef.current = 0;
    setCurrentRepeatDisplay(0);
  }, []);

  const handleNext = useCallback(() => {
    if (delayTimerRef.current) { clearTimeout(delayTimerRef.current); delayTimerRef.current = null; }
    window.speechSynthesis?.cancel();

    const nextIndex = currentIndexRef.current + wordsPerSetRef.current;
    const allWords = wordsRef.current;

    if (nextIndex >= allWords.length) {
      // Wrap to beginning
      currentIndexRef.current = 0;
      setCurrentIndex(0);
    } else {
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
    }

    currentRepeatRef.current = 0;
    setCurrentRepeatDisplay(0);

    // If was playing (including Rule A stopped state), start speaking the new set
    // Always auto-play on Next click for better UX
    setIsPlaying(true);
    isPlayingRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;
    speakCurrentSet();
  }, [speakCurrentSet]);

  const handleWordClick = useCallback(
    (index: number) => {
      if (delayTimerRef.current) { clearTimeout(delayTimerRef.current); delayTimerRef.current = null; }
      window.speechSynthesis?.cancel();

      currentIndexRef.current = index;
      setCurrentIndex(index);
      currentRepeatRef.current = 0;
      setCurrentRepeatDisplay(0);

      setIsPlaying(true);
      isPlayingRef.current = true;
      setIsPaused(false);
      isPausedRef.current = false;
      speakCurrentSet();
    },
    [speakCurrentSet]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Header ── */}
      <header className="border-b border-border-subtle/50 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-[0_0_20px_rgba(30,215,96,0.2)]">
              <Volume2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                ReadAloud
              </h1>
              <p className="text-[11px] text-text-muted font-medium tracking-wider uppercase">
                Dictation Studio
              </p>
            </div>
          </div>

          {/* Status pill */}
          {words.length > 0 && (
            <div
              className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                ${
                  isPlaying && !isPaused
                    ? "bg-brand/10 text-brand"
                    : isPaused
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-surface text-text-secondary"
                }
                transition-all duration-300
              `}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isPlaying && !isPaused
                    ? "bg-brand animate-pulse"
                    : isPaused
                    ? "bg-amber-400"
                    : "bg-text-muted"
                }`}
              />
              {isPlaying && !isPaused
                ? "Speaking"
                : isPaused
                ? "Paused"
                : "Ready"}
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6">
        {/* Script Input Section */}
        <section className="py-6 sm:py-8">
          <ScriptInput
            onLoadScript={handleLoadScript}
            isLoaded={words.length > 0}
            onClear={handleClear}
          />
        </section>

        {/* Divider */}
        {words.length > 0 && (
          <div className="flex items-center gap-4 px-2 mb-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
            <span className="text-[11px] font-medium text-text-muted tracking-widest uppercase">
              {words.length} words loaded
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
          </div>
        )}

        {/* Text Display */}
        <TextDisplay
          words={words}
          currentIndex={currentIndex}
          wordsPerSet={wordsPerSet}
          isPlaying={isPlaying}
          onWordClick={handleWordClick}
        />
      </main>

      {/* ── Sticky Playback Controls ── */}
      {words.length > 0 && (
        <PlaybackControls
          wordsPerSet={wordsPerSet}
          repeatCount={repeatCount}
          delay={delay}
          onWordsPerSetChange={setWordsPerSet}
          onRepeatCountChange={setRepeatCount}
          onDelayChange={setDelay}
          isPlaying={isPlaying}
          isPaused={isPaused}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onNext={handleNext}
          currentSetIndex={currentSetIndex}
          totalSets={totalSets}
          currentRepeat={currentRepeatDisplay}
          hasWords={words.length > 0}
        />
      )}
    </div>
  );
}
