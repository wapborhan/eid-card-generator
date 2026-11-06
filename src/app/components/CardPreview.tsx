"use client";

import { useState, useEffect, useRef } from "react";
import { Template } from "../lib/templates";
import { CardState, processCardSvg } from "../lib/svgProcessor";

interface CardPreviewProps {
  template: Template;
  cardState: CardState;
  onSvgGenerated: (svgContent: string) => void;
}

export default function CardPreview({
  template,
  cardState,
  onSvgGenerated,
}: CardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    const renderCard = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(template.path);
        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.statusText}`);
        }
        const svgRaw = await response.text();

        const processed = await processCardSvg(svgRaw, template, cardState);

        if (!isCancelled) {
          setSvgContent(processed);
          onSvgGenerated(processed);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        console.error("CardPreview render error:", err);
        if (!isCancelled) {
          setLoadError("টেমপ্লেট লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
          setIsLoading(false);
        }
      }
    };

    renderCard();

    return () => {
      isCancelled = true;
    };
  }, [template, cardState, onSvgGenerated]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Frame wrapper with gold ambient glow */}
      <div className="relative w-full max-w-[440px] group transition-all duration-300">
        {/* Ambient Back Glow */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/25 via-emerald-500/20 to-amber-500/25 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />

        {/* Card Canvas Container */}
        <div className="relative bg-slate-900/90 rounded-2xl p-2.5 sm:p-3 border border-amber-500/30 shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Card Meta Badge & Fullscreen Trigger */}
          <div className="flex items-center justify-between pb-2 px-1 text-xs text-slate-400 border-b border-slate-800 mb-2.5">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-slate-300">লাইভ প্রিভিউ</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full text-[11px] border border-amber-500/20">
                {template.category === "exclusive" ? "এক্সক্লুসিভ ফ্রেম" : "ক্লাসিক"}
              </span>

              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-300 transition"
                title="পূর্ণ স্ক্রিনে দেখুন"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M13.25 2.5a.75.75 0 0 0 0 1.5h2.44l-3.97 3.97a.75.75 0 1 0 1.06 1.06L16.75 5.06v2.44a.75.75 0 0 0 1.5 0v-4.25a.75.75 0 0 0-.75-.75h-4.25ZM6.75 17.5a.75.75 0 0 0 0-1.5H4.31l3.97-3.97a.75.75 0 0 0-1.06-1.06L3.25 14.94v-2.44a.75.75 0 0 0-1.5 0v4.25c0 .414.336.75.75.75h4.25Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* SVG Card Container */}
          <div
            ref={containerRef}
            id="cardPreviewContainer"
            className="w-full aspect-[5/8] rounded-xl overflow-hidden shadow-inner bg-slate-950 flex items-center justify-center relative eid-card-svg-wrapper"
          >
            {isLoading && !svgContent && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-10 space-y-3">
                <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-amber-200">কার্ড সাজানো হচ্ছে...</p>
              </div>
            )}

            {loadError ? (
              <div className="p-6 text-center text-red-400 text-sm">
                <p>{loadError}</p>
              </div>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:block [&_svg]:object-contain"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            )}
          </div>
        </div>
      </div>

      {/* FULLSCREEN PREVIEW MODAL */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="relative max-w-lg w-full max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute -top-10 right-0 text-slate-300 hover:text-white text-sm font-semibold flex items-center space-x-1 p-1 bg-slate-900/80 rounded-lg px-2 border border-slate-700"
            >
              <span>✕ বন্ধ করুন</span>
            </button>
            <div
              className="w-full aspect-[5/8] rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/40 bg-slate-950 [&_svg]:w-full [&_svg]:h-full [&_svg]:object-contain"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
