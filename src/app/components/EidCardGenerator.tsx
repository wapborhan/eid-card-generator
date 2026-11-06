"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { templates } from "../lib/templates";
import { CardState } from "../lib/svgProcessor";
import CardPreview from "./CardPreview";
import TemplateThumbnails from "./TemplateThumbnails";
import Controls from "./Controls";
import Link from "next/link";

const INITIAL_CARD_STATE: CardState = {
  senderName: "",
  designation: "",
  receiverName: "",
  greetingTitle: "ঈদ মোবারক",
  note: "আপনার ও আপনার পরিবারের জন্য রইল পবিত্র ঈদের আন্তরিক শুভেচ্ছা ও অফুরন্ত ভালোবাসা। ঈদ মোবারক!",
  photoUrl: undefined,
  photoFrameShape: "circle",
  photoZoom: 1.0,
  photoOffsetX: 0,
  photoOffsetY: 0,
  fontSizeScale: 1.0,
  showYearTag: true,
  yearTagText: "পবিত্র ঈদুল ফিতর ২০২৫ • ১৪৪৬ হিজরি",
};

const SAMPLE_CARD_DATA: CardState = {
  senderName: "মোহাম্মদ তানভীর আহমেদ",
  designation: "সফটওয়্যার ইঞ্জিনিয়ার",
  receiverName: "শ্রদ্ধেয় ও প্রিয় শুভাকাঙ্ক্ষী",
  greetingTitle: "ঈদ মোবারক",
  note: "ঈদ বয়ে আনুক আপনার ও আপনার পরিবারের জীবনে অনাবিল সুখ, শান্তি, সমৃদ্ধি ও নির্মল আনন্দ। ঈদ মোবারক!",
  photoUrl: undefined,
  photoFrameShape: "circle",
  photoZoom: 1.0,
  photoOffsetX: 0,
  photoOffsetY: 0,
  fontSizeScale: 1.0,
  showYearTag: true,
  yearTagText: "পবিত্র ঈদুল ফিতর ২০২৫ • ১৪৪৬ হিজরি",
};

export default function EidCardGenerator() {
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [cardState, setCardState] = useState<CardState>(INITIAL_CARD_STATE);
  const [svgContent, setSvgContent] = useState<string>("");
  const [mobileViewTab, setMobileViewTab] = useState<"form" | "preview">(
    "form",
  );
  const searchParams = useSearchParams();

  // Load URL parameters if card was shared
  useEffect(() => {
    const urlName = searchParams.get("name");
    const templateId = searchParams.get("id");
    const urlNote = searchParams.get("note");
    const urlTo = searchParams.get("to");
    const urlTitle = searchParams.get("title");

    if (urlName || urlNote || urlTo || urlTitle) {
      setCardState((prev) => ({
        ...prev,
        senderName: urlName || prev.senderName,
        note: urlNote || prev.note,
        receiverName: urlTo || prev.receiverName,
        designation: urlTitle || prev.designation,
      }));
    }

    if (templateId) {
      const index = parseInt(templateId, 10) - 1;
      if (index >= 0 && index < templates.length) {
        setCurrentTemplateIndex(index);
      }
    }
  }, [searchParams]);

  const handleUpdateCardState = useCallback(
    (updater: Partial<CardState> | ((prev: CardState) => CardState)) => {
      setCardState((prev) => {
        if (typeof updater === "function") {
          return updater(prev);
        }
        return { ...prev, ...updater };
      });
    },
    [],
  );

  const handleReset = () => {
    if (confirm("আপনি কি কার্ডের সকল তথ্য রিসেট করতে চান?")) {
      setCardState(INITIAL_CARD_STATE);
    }
  };

  const handleFillSample = () => {
    setCardState((prev) => ({
      ...prev,
      ...SAMPLE_CARD_DATA,
      // Retain user's photo if already uploaded
      photoUrl: prev.photoUrl || SAMPLE_CARD_DATA.photoUrl,
    }));
  };

  const currentTemplate = templates[currentTemplateIndex] || templates[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#07131e] to-slate-950 text-slate-100 flex flex-col justify-between py-6 px-3 sm:px-6 lg:px-8 selection:bg-amber-400 selection:text-slate-950">
      {/* Background Decorative Islamic Stars Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex-1">
        {/* TOP BRAND HEADER */}
        <header className="text-center mb-8 relative">
          {/* Glowing Pill Tag */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3 backdrop-blur-md shadow-lg shadow-amber-500/5">
            <span className="text-amber-400 animate-spin">✦</span>
            <span>ঈদ কার্ড জেনারেটর • এক্সক্লুসিভ ফ্রেম ও ছবি যোগ করুন</span>
            <span className="text-emerald-400">❖</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent drop-shadow-sm">
            ঈদ মোবারক শুভেচ্ছা কার্ড
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            লগইন ছাড়াই সহজে নিজের ছবি যুক্ত করুন, মনের মতো ফ্রেম বেছে নিন এবং এক
            ক্লিকে হাই-রেজোলিউশন ঈদ কার্ড ডাউনলোড করুন।
          </p>

          {/* Mobile View Switcher (Visible only on mobile/tablets) */}
          <div className="mt-4 flex lg:hidden items-center justify-center">
            <div className="inline-flex p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md">
              <button
                type="button"
                onClick={() => setMobileViewTab("form")}
                className={`py-1.5 px-5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  mobileViewTab === "form"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>✏️</span>
                <span>কার্ড সাজান (Form)</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileViewTab("preview")}
                className={`py-1.5 px-5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  mobileViewTab === "preview"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>👁️</span>
                <span>কার্ড প্রিভিউ & ডাউনলোড</span>
              </button>
            </div>
          </div>
        </header>

        {/* MAIN TWO-COLUMN WORKSPACE: LEFT FORM, RIGHT PREVIEW */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT SIDE: FORM FILL-UP ================= */}
          <div
            className={`lg:col-span-7 xl:col-span-7 space-y-6 ${
              mobileViewTab === "form" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Template Selection Container */}
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-xl shadow-slate-950/40">
              <TemplateThumbnails
                templates={templates}
                currentIndex={currentTemplateIndex}
                onSelect={(idx) => {
                  setCurrentTemplateIndex(idx);
                  // Update text color with template default if user hasn't explicitly customized it
                  if (!cardState.textColor) {
                    setCardState((prev) => ({
                      ...prev,
                      textColor: templates[idx].color,
                    }));
                  }
                }}
              />
            </div>

            {/* Form Controls Container */}
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-xl shadow-slate-950/40">
              <Controls
                cardState={cardState}
                onUpdateCardState={handleUpdateCardState}
                currentTemplateIndex={currentTemplateIndex}
                svgContent={svgContent}
                onReset={handleReset}
                onFillSample={handleFillSample}
              />
            </div>
          </div>

          {/* ================= RIGHT SIDE: STICKY LIVE PREVIEW ================= */}
          <div
            className={`lg:col-span-5 xl:col-span-5 lg:sticky lg:top-6 space-y-4 ${
              mobileViewTab === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-xl shadow-slate-950/40 flex flex-col items-center">
              <CardPreview
                template={currentTemplate}
                cardState={cardState}
                onSvgGenerated={setSvgContent}
              />

              {/* Quick Actions Helper Under Preview */}
              <div className="w-full mt-4 text-center">
                <p className="text-[11px] text-slate-400">
                  💡 বাম পাশে আপনার তথ্য লিখুন বা ছবি আপলোড করুন, এখানে সাথে
                  সাথে দেখতে পাবেন।
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 text-center text-xs text-slate-500 py-4 border-t border-slate-900/80">
        <p>
          ঈদ মোবারক! ডিজাইন ও ডেভেলপমেন্ট করেছেন{" "}
          <Link
            target="__BLANK"
            href="https://www.wapborhan.com"
            className="underline font-bold"
          >
            বোরহান উদ্দিন
          </Link>{" "}
          । সকল অধিকার সংরক্ষিত।
        </p>
      </footer>
    </div>
  );
}
