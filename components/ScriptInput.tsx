"use client";

import React, { useState } from "react";
import { FileText, Upload, Trash2 } from "lucide-react";

interface ScriptInputProps {
  onLoadScript: (words: string[]) => void;
  isLoaded: boolean;
  onClear: () => void;
}

export default function ScriptInput({ onLoadScript, isLoaded, onClear }: ScriptInputProps) {
  const [text, setText] = useState("");

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleLoad = () => {
    if (!text.trim()) return;
    const words = text.trim().split(/\s+/).filter(Boolean);
    onLoadScript(words);
  };

  const handleClear = () => {
    setText("");
    onClear();
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Your Script</h2>
          <p className="text-sm text-text-secondary">Paste or type the text you want to read aloud</p>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative group">
        <textarea
          id="script-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your script, speech, study notes, or any text here..."
          rows={8}
          disabled={isLoaded}
          className={`
            w-full rounded-2xl px-5 py-4
            bg-card border border-border-subtle
            text-[15px] leading-relaxed text-white placeholder-text-muted
            resize-none transition-all duration-300
            focus:border-brand/40 focus:ring-0 focus:outline-none
            hover:border-border-subtle/80
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />

        {/* Stats Bar */}
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-surface px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-brand/60" />
              {wordCount.toLocaleString()} words
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-surface px-3 py-1.5 rounded-full">
              {charCount.toLocaleString()} chars
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isLoaded ? (
              <button
                id="clear-script-btn"
                onClick={handleClear}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  bg-red-500/10 text-red-400 border border-red-500/20
                  hover:bg-red-500/20 hover:border-red-500/30
                  transition-all duration-200 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            ) : (
              <button
                id="load-script-btn"
                onClick={handleLoad}
                disabled={!text.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold
                  bg-brand text-black
                  hover:bg-brand-dim hover:scale-[1.02]
                  disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
                  active:scale-[0.98]
                  transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(30,215,96,0.15)]
                  hover:shadow-[0_0_30px_rgba(30,215,96,0.25)]"
              >
                <Upload className="w-4 h-4" />
                Load Script
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
