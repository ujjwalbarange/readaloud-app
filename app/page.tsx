"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Volume2 } from "lucide-react";
import ScriptInput from "@/components/ScriptInput";
import PlaybackControls from "@/components/PlaybackControls";
import TextDisplay from "@/components/TextDisplay";

// ── Types ──
interface SetRange {
  start: number;
  end: number;
}

// ── Smart Parsing ──
// Splits text into words and detects sentence/line boundaries.
// Boundaries occur after words ending with . ! ? , ; : or at line breaks.
function parseWordsAndBoundaries(rawText: string): {
  words: string[];
  boundaries: Set<number>;
} {
  const words: string[] = [];
  const boundaries = new Set<number>();

  const lines = rawText.split(/\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const lineWords = trimmed.split(/\s+/).filter(Boolean);
    if (lineWords.length === 0) continue;

    const lineStartIdx = words.length;
    words.push(...lineWords);
    const lineEndIdx = words.length - 1;

    // End of every line is a natural boundary
    boundaries.add(lineEndIdx);

    // Words ending with sentence-ending punctuation are also boundaries
    for (let i = lineStartIdx; i <= lineEndIdx; i++) {
      if (/[.!?,;:]$/.test(words[i])) {
        boundaries.add(i);
      }
    }
  }

  return { words, boundaries };
}

// Builds variable-size sets that respect sentence/line boundaries.
// If a boundary falls inside a potential chunk, the set ends at that boundary.
function computeSets(
  wordCount: number,
  maxWordsPerSet: number,
  boundaries: Set<number>
): SetRange[] {
  const sets: SetRange[] = [];
  let start = 0;

  while (start < wordCount) {
    let end = Math.min(start + maxWordsPerSet, wordCount);

    // Check if a boundary exists before the full chunk endpoint
    for (let i = start; i < end; i++) {
      if (boundaries.has(i)) {
        end = i + 1; // Include the boundary word, then break
        break;
      }
    }

    sets.push({ start, end });
    start = end;
  }

  return sets;
}

// ═══════════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════════
export default function HomePage() {
  // ── State ──
  const [rawText, setRawText] = useState("");
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [speakingWordIdx, setSpeakingWordIdx] = useState(-1);
  const [wordsPerSet, setWordsPerSet] = useState(5);
  const [repeatCount, setRepeatCount] = useState(1);
  const [wordDelay, setWordDelay] = useState(0);
  const [setDelay, setSetDelay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRepeatDisplay, setCurrentRepeatDisplay] = useState(0);

  // ── Derived Data (memoised) ──
  const { words, boundaries } = useMemo(() => {
    if (!rawText) return { words: [] as string[], boundaries: new Set<number>() };
    return parseWordsAndBoundaries(rawText);
  }, [rawText]);

  const sets = useMemo(() => {
    if (words.length === 0) return [] as SetRange[];
    return computeSets(words.length, wordsPerSet, boundaries);
  }, [words, wordsPerSet, boundaries]);

  // ── Refs (stale-closure safe inside Web Speech API callbacks) ──
  const currentSetIdxRef = useRef(0);
  const repeatCountRef = useRef(1);
  const wordDelayRef = useRef(0);
  const setDelayRef = useRef(0);
  const currentRepeatRef = useRef(0);
  const isPlayingRef = useRef(false);
  const wordsRef = useRef<string[]>([]);
  const setsRef = useRef<SetRange[]>([]);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sync refs with state ──
  useEffect(() => { repeatCountRef.current = repeatCount; }, [repeatCount]);
  useEffect(() => { wordDelayRef.current = wordDelay; }, [wordDelay]);
  useEffect(() => { setDelayRef.current = setDelay; }, [setDelay]);
  useEffect(() => { wordsRef.current = words; }, [words]);

  // When sets recompute (text or wordsPerSet changed), reset playback
  useEffect(() => {
    clearTimers();
    window.speechSynthesis?.cancel();
    setsRef.current = sets;
    currentSetIdxRef.current = 0;
    setCurrentSetIdx(0);
    setSpeakingWordIdx(-1);
    isPlayingRef.current = false;
    setIsPlaying(false);
    currentRepeatRef.current = 0;
    setCurrentRepeatDisplay(0);
  }, [sets]);

  // ── Helpers ──
  const clearTimers = () => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
  };

  // ── Speech Engine ──
  // Dual-mode: fluent (wordDelay=0) or word-by-word (wordDelay>0)
  const speakWordAtIndex = useCallback((globalIdx: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!isPlayingRef.current) return;

    const allWords = wordsRef.current;
    if (globalIdx >= allWords.length) return;

    const currentSet = setsRef.current[currentSetIdxRef.current];
    if (!currentSet) return;

    window.speechSynthesis.cancel();

    // ── Shared logic: called when the entire set has been spoken ──
    const handleSetComplete = () => {
      if (!isPlayingRef.current) return;

      const rc = repeatCountRef.current;
      const rep = currentRepeatRef.current;
      const sdMs = setDelayRef.current * 1000;

      const scheduleNext = (action: () => void) => {
        if (sdMs > 0) {
          delayTimerRef.current = setTimeout(action, sdMs);
        } else {
          action();
        }
      };

      if (rc === 0) {
        // Rule A: Manual mode — stop and wait for "Next" click
        isPlayingRef.current = false;
        setIsPlaying(false);
        setSpeakingWordIdx(-1);
        return;
      }

      if (rep < rc) {
        // Still have repeats left → replay from set start
        currentRepeatRef.current = rep + 1;
        setCurrentRepeatDisplay(rep + 1);
        const set = setsRef.current[currentSetIdxRef.current];
        scheduleNext(() => speakWordAtIndex(set.start));
      } else {
        // All repeats done → advance to next set
        const nextSetIdx = currentSetIdxRef.current + 1;

        if (nextSetIdx >= setsRef.current.length) {
          // Reached the end of all text
          isPlayingRef.current = false;
          setIsPlaying(false);
          currentSetIdxRef.current = 0;
          setCurrentSetIdx(0);
          setSpeakingWordIdx(-1);
          currentRepeatRef.current = 0;
          setCurrentRepeatDisplay(0);
          return;
        }

        currentSetIdxRef.current = nextSetIdx;
        setCurrentSetIdx(nextSetIdx);
        currentRepeatRef.current = 0;
        setCurrentRepeatDisplay(0);
        const nextSet = setsRef.current[nextSetIdx];
        scheduleNext(() => speakWordAtIndex(nextSet.start));
      }
    };

    if (wordDelayRef.current === 0) {
      // ── FLUENT MODE: speak remaining words in set as one natural utterance ──
      const text = allWords.slice(globalIdx, currentSet.end).join(" ");
      setSpeakingWordIdx(-1); // no per-word highlight; whole set highlights

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onend = () => handleSetComplete();
      window.speechSynthesis.speak(utterance);
    } else {
      // ── WORD-BY-WORD MODE: speak a single word, then schedule next ──
      const word = allWords[globalIdx];
      if (!word) return;

      setSpeakingWordIdx(globalIdx);

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onend = () => {
        if (!isPlayingRef.current) return;

        const nextWordIdx = globalIdx + 1;

        if (nextWordIdx < currentSet.end) {
          // More words in set → wait then speak next word
          const wdMs = wordDelayRef.current * 1000;
          delayTimerRef.current = setTimeout(
            () => speakWordAtIndex(nextWordIdx),
            wdMs
          );
        } else {
          // Set complete
          handleSetComplete();
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // ── Handlers ──
  const handleLoadScript = useCallback((text: string) => {
    clearTimers();
    window.speechSynthesis?.cancel();
    setRawText(text);
    // Position reset happens automatically via the `sets` useEffect
  }, []);

  const handleClear = useCallback(() => {
    clearTimers();
    window.speechSynthesis?.cancel();
    setRawText("");
  }, []);

  const handlePlay = useCallback(() => {
    if (setsRef.current.length === 0) return;

    clearTimers();
    window.speechSynthesis?.cancel();

    const currentSet = setsRef.current[currentSetIdxRef.current];
    if (!currentSet) return;

    setIsPlaying(true);
    isPlayingRef.current = true;
    currentRepeatRef.current = 0;
    setCurrentRepeatDisplay(0);
    speakWordAtIndex(currentSet.start);
  }, [speakWordAtIndex]);

  const handleStop = useCallback(() => {
    clearTimers();
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setSpeakingWordIdx(-1);
    currentRepeatRef.current = 0;
    setCurrentRepeatDisplay(0);
  }, []);

  const handleRepeat = useCallback(() => {
    clearTimers();
    window.speechSynthesis?.cancel();

    const currentSet = setsRef.current[currentSetIdxRef.current];
    if (!currentSet) return;

    currentRepeatRef.current = 0;
    setCurrentRepeatDisplay(0);
    setIsPlaying(true);
    isPlayingRef.current = true;
    speakWordAtIndex(currentSet.start);
  }, [speakWordAtIndex]);

  const handleNext = useCallback(() => {
    clearTimers();
    window.speechSynthesis?.cancel();

    let nextSetIdx = currentSetIdxRef.current + 1;
    if (nextSetIdx >= setsRef.current.length) {
      nextSetIdx = 0; // wrap around
    }

    currentSetIdxRef.current = nextSetIdx;
    setCurrentSetIdx(nextSetIdx);
    currentRepeatRef.current = 0;
    setCurrentRepeatDisplay(0);

    const nextSet = setsRef.current[nextSetIdx];
    if (!nextSet) return;

    setIsPlaying(true);
    isPlayingRef.current = true;
    speakWordAtIndex(nextSet.start);
  }, [speakWordAtIndex]);

  const handleWordClick = useCallback(
    (clickedWordIdx: number) => {
      clearTimers();
      window.speechSynthesis?.cancel();

      // Find which set contains the clicked word
      const setIdx = setsRef.current.findIndex(
        (s) => clickedWordIdx >= s.start && clickedWordIdx < s.end
      );
      if (setIdx === -1) return;

      currentSetIdxRef.current = setIdx;
      setCurrentSetIdx(setIdx);
      currentRepeatRef.current = 0;
      setCurrentRepeatDisplay(0);

      setIsPlaying(true);
      isPlayingRef.current = true;
      speakWordAtIndex(clickedWordIdx);
    },
    [speakWordAtIndex]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // ── Computed for display ──
  const totalSets = sets.length;
  const activeSet = sets[currentSetIdx];

  // ═══════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════
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
                ${isPlaying ? "bg-brand/10 text-brand" : "bg-surface text-text-secondary"}
                transition-all duration-300
              `}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isPlaying ? "bg-brand animate-pulse" : "bg-text-muted"
                }`}
              />
              {isPlaying ? "Speaking" : "Ready"}
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
              {words.length} words · {totalSets} sets
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
          </div>
        )}

        {/* Text Display */}
        <TextDisplay
          words={words}
          activeSetStart={activeSet?.start ?? 0}
          activeSetEnd={activeSet?.end ?? 0}
          speakingWordIdx={speakingWordIdx}
          isPlaying={isPlaying}
          onWordClick={handleWordClick}
        />
      </main>

      {/* ── Sticky Playback Controls ── */}
      {words.length > 0 && (
        <PlaybackControls
          wordsPerSet={wordsPerSet}
          repeatCount={repeatCount}
          wordDelay={wordDelay}
          setDelay={setDelay}
          onWordsPerSetChange={setWordsPerSet}
          onRepeatCountChange={setRepeatCount}
          onWordDelayChange={setWordDelay}
          onSetDelayChange={setSetDelay}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onStop={handleStop}
          onRepeat={handleRepeat}
          onNext={handleNext}
          currentSetIndex={currentSetIdx}
          totalSets={totalSets}
          currentRepeat={currentRepeatDisplay}
          hasWords={words.length > 0}
        />
      )}
    </div>
  );
}
