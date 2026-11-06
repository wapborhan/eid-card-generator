"use client";

import { useRef, useState, ChangeEvent } from "react";
import { CardState } from "../lib/svgProcessor";
import QRCodeGenerator from "./QRCodeGenerator";

interface ControlsProps {
  cardState: CardState;
  onUpdateCardState: (updater: Partial<CardState> | ((prev: CardState) => CardState)) => void;
  currentTemplateIndex: number;
  svgContent?: string;
  onReset: () => void;
  onFillSample: () => void;
}

const PRESET_WISHES = [
  "আপনার ও আপনার পরিবারের জন্য রইল পবিত্র ঈদের আন্তরিক শুভেচ্ছা ও অফুরন্ত ভালোবাসা। ঈদ মোবারক!",
  "ঈদ বয়ে আনুক আপনার জীবনে অনাবিল সুখ, শান্তি, সমৃদ্ধি ও নির্মল আনন্দ। ঈদ মোবারক!",
  "তাকাব্বালাল্লাহু মিন্না ওয়া মিনকুম — মহান আল্লাহ আমাদের সকলের নেক আমল কবুল করুন। ঈদ মোবারক!",
  "দূর হোক সব গ্লানি ও হতাশা, ভরে উঠুক নতুন স্বপ্নে ও ভালোবাসায়। আনন্দময় হোক আপনার ঈদ!",
];

const PRESET_COLORS = [
  { name: "স্বর্ণালী (Gold)", value: "#ffd978" },
  { name: "উজ্জ্বল হলুদ (Amber)", value: "#ffb400" },
  { name: "পান্না সবুজ (Emerald)", value: "#34d399" },
  { name: "রোজ গোল্ড (Rose Gold)", value: "#f5d6c6" },
  { name: "শুভ্র সাদা (Pure White)", value: "#ffffff" },
  { name: "আকাশি নীল (Cyan)", value: "#7ed6df" },
  { name: "ক্লাসিক চারকোল (Dark)", value: "#2d3436" },
];

export default function Controls({
  cardState,
  onUpdateCardState,
  currentTemplateIndex,
  svgContent = "",
  onReset,
  onFillSample,
}: ControlsProps) {
  const [showQR, setShowQR] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "photo" | "style">("info");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // Photo Upload Handler
  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("দয়া করে একটি ছবি (JPG, PNG, WebP) নির্বাচন করুন।");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("ছবির সাইজ ৮ মেগাবাইট (8MB) এর বেশি হতে পারবে না।");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdateCardState({ photoUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    onUpdateCardState({ photoUrl: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // High Resolution Download Handler
  const handleDownload = async () => {
    if (!svgContent) {
      alert("কার্ডটি এখনও প্রস্তুত হয়নি। একটু অপেক্ষা করুন।");
      return;
    }

    setIsDownloading(true);
    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = svgContent;
      const svgElement = tempDiv.querySelector("svg");

      if (!svgElement) {
        throw new Error("SVG কনটেন্ট পাওয়া যায়নি");
      }

      let width = 1000;
      let height = 1600;

      const viewBox = svgElement.getAttribute("viewBox");
      if (viewBox) {
        const parts = viewBox.split(/\s+|,/).filter(Boolean).map(Number);
        if (parts.length >= 4 && parts[2] && parts[3]) {
          width = parts[2];
          height = parts[3];
        }
      }

      // Ultra-HD DPI scale: 3x gives crisp print & social media quality
      const scale = 3;
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas context initialize failed");
      }

      // Explicitly set width & height on root SVG for rasterizing onto canvas
      svgElement.setAttribute("width", width.toString());
      svgElement.setAttribute("height", height.toString());
      const downloadSvgString = new XMLSerializer().serializeToString(svgElement);

      const svgBlob = new Blob([downloadSvgString], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        try {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0, width, height);

          const safeName = (cardState.senderName || "eid-card").replace(/\s+/g, "_").toLowerCase();
          const fileName = `eid-mubarak-${safeName}-${Date.now()}.png`;

          if (downloadLinkRef.current) {
            downloadLinkRef.current.href = canvas.toDataURL("image/png", 1.0);
            downloadLinkRef.current.download = fileName;
            downloadLinkRef.current.click();
          }

          URL.revokeObjectURL(svgUrl);
        } catch (renderErr) {
          console.error("Canvas draw error:", renderErr);
          alert("কার্ড ইমেজ তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
        } finally {
          setIsDownloading(false);
        }
      };

      img.onerror = (imgErr) => {
        console.error("SVG image load error:", imgErr);
        alert("কার্ডটি ইমেজে রূপান্তর করতে সমস্যা হয়েছে।");
        URL.revokeObjectURL(svgUrl);
        setIsDownloading(false);
      };

      img.src = svgUrl;
    } catch (error) {
      console.error("Download failed:", error);
      alert("ডাউনলোড করতে ব্যর্থ হয়েছে।");
      setIsDownloading(false);
    }
  };

  // Web Share / Copy Link
  const handleShare = () => {
    const params = new URLSearchParams();
    if (cardState.senderName) params.set("name", cardState.senderName);
    if (cardState.designation) params.set("title", cardState.designation);
    if (cardState.receiverName) params.set("to", cardState.receiverName);
    if (cardState.note) params.set("note", cardState.note);
    params.set("id", (currentTemplateIndex + 1).toString());

    const shareUrl = `${window.location.origin}/?${params.toString()}`;

    if (navigator.share) {
      navigator
        .share({
          title: "ঈদ মোবারক শুভেচ্ছা কার্ড",
          text: `${cardState.senderName ? `${cardState.senderName}-এর পক্ষ থেকে ` : ""}পবিত্র ঈদের আন্তরিক শুভেচ্ছা!`,
          url: shareUrl,
        })
        .catch(() => copyToClipboard(shareUrl));
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert("কার্ডের শেয়ার লিংক কপি করা হয়েছে!"))
      .catch(() => alert("লিংক কপি করতে ব্যর্থ হয়েছে।"));
  };

  return (
    <div className="space-y-5">
      <a ref={downloadLinkRef} className="hidden" aria-hidden="true" />

      {/* Tabs Header */}
      <div className="flex items-center space-x-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === "info"
              ? "bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>✍️</span>
          <span>তথ্য ও বার্তা</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("photo")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === "photo"
              ? "bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>📷</span>
          <span>ছবি আপলোড</span>
          {cardState.photoUrl && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("style")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === "style"
              ? "bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>🎨</span>
          <span>রঙ ও ফন্ট</span>
        </button>
      </div>

      {/* TAB 1: INFO & MESSAGE */}
      {activeTab === "info" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Sender Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              আপনার নাম <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={cardState.senderName}
              onChange={(e) => onUpdateCardState({ senderName: e.target.value })}
              placeholder="যেমন: তানভীর আহমেদ"
              maxLength={45}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 text-slate-100 placeholder-slate-500 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 focus:outline-none transition text-sm"
            />
          </div>

          {/* Designation & Receiver in 2-Col Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                পদবী বা পরিচয় <span className="text-slate-500">(ঐচ্ছিক)</span>
              </label>
              <input
                type="text"
                value={cardState.designation || ""}
                onChange={(e) => onUpdateCardState({ designation: e.target.value })}
                placeholder="যেমন: সফটওয়্যার ইঞ্জিনিয়ার"
                maxLength={40}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 text-slate-100 placeholder-slate-500 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 focus:outline-none transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                কার জন্য / প্রাপক <span className="text-slate-500">(ঐচ্ছিক)</span>
              </label>
              <input
                type="text"
                value={cardState.receiverName || ""}
                onChange={(e) => onUpdateCardState({ receiverName: e.target.value })}
                placeholder="যেমন: প্রিয় বন্ধু রাফি"
                maxLength={40}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 text-slate-100 placeholder-slate-500 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 focus:outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Eid Note / Wishes Message */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                শুভেচ্ছা বার্তা
              </label>
              <span className="text-[11px] text-slate-500">
                {cardState.note?.length || 0}/150
              </span>
            </div>
            <textarea
              value={cardState.note}
              onChange={(e) => onUpdateCardState({ note: e.target.value })}
              placeholder="আপনার আন্তরিক শুভেচ্ছা বার্তাটি লিখুন..."
              maxLength={150}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 text-slate-100 placeholder-slate-500 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 focus:outline-none transition text-sm resize-none"
            />

            {/* Quick Wish Preset Buttons */}
            <div className="mt-2.5">
              <p className="text-[11px] text-amber-300/80 mb-1.5 flex items-center space-x-1">
                <span>⚡</span>
                <span>এক ক্লিকে শুভেচ্ছা বার্তা পছন্দ করুন:</span>
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {PRESET_WISHES.map((wish, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onUpdateCardState({ note: wish })}
                    className="text-left text-xs p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-amber-200 border border-slate-800 hover:border-amber-500/30 transition truncate"
                    title={wish}
                  >
                    • {wish}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PHOTO UPLOAD */}
      {activeTab === "photo" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {/* Upload Drop Zone / Button */}
          {!cardState.photoUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl p-6 text-center cursor-pointer transition group"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 flex items-center justify-center text-amber-300 text-2xl group-hover:scale-110 transition duration-300 border border-amber-500/30">
                📷
              </div>
              <h4 className="mt-3 text-sm font-semibold text-slate-200">
                আপনার ছবি আপলোড করুন
              </h4>
              <p className="mt-1 text-xs text-slate-400">
                JPG, PNG বা WebP ফরম্যাট (সর্বোচ্চ 8MB)
              </p>
              <button
                type="button"
                className="mt-3 px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md group-hover:shadow-amber-500/20 transition"
              >
                ছবি নির্বাচন করুন
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/80 bg-slate-950 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cardState.photoUrl}
                      alt="Uploaded avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">ছবি যুক্ত হয়েছে ✓</p>
                    <p className="text-[11px] text-emerald-400">কার্ডে ছবি প্রদর্শিত হচ্ছে</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 transition"
                  >
                    বদলান
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1 text-xs text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/30 transition"
                  >
                    মুছুন
                  </button>
                </div>
              </div>

              {/* Frame Shape Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  ছবির ফ্রেমের আকার (Shape):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "circle", label: "গোল (Circle)", icon: "⚪" },
                    { id: "arch", label: "আর্চ (Arch)", icon: "🕌" },
                    { id: "squircle", label: "স্কয়ার (Shield)", icon: "▢" },
                  ].map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() =>
                        onUpdateCardState({
                          photoFrameShape: shape.id as CardState["photoFrameShape"],
                        })
                      }
                      className={`p-2 rounded-xl text-xs font-medium border text-center transition flex flex-col items-center space-y-1 ${
                        cardState.photoFrameShape === shape.id
                          ? "bg-amber-500/20 border-amber-400 text-amber-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span className="text-sm">{shape.icon}</span>
                      <span>{shape.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Zoom Slider */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span>ছবির জুম (Zoom):</span>
                  <span className="text-amber-400">{Math.round(cardState.photoZoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.6"
                  step="0.05"
                  value={cardState.photoZoom}
                  onChange={(e) =>
                    onUpdateCardState({ photoZoom: parseFloat(e.target.value) })
                  }
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Photo Horizontal & Vertical Offset Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span>ডানে-বামে সরান (Left/Right):</span>
                    <span className="text-amber-400">{cardState.photoOffsetX || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    step="2"
                    value={cardState.photoOffsetX || 0}
                    onChange={(e) =>
                      onUpdateCardState({ photoOffsetX: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span>উপরে-নিচে সরান (Up/Down):</span>
                    <span className="text-amber-400">{cardState.photoOffsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    step="2"
                    value={cardState.photoOffsetY}
                    onChange={(e) =>
                      onUpdateCardState({ photoOffsetY: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STYLING & COLORS */}
      {activeTab === "style" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Text Color Swatches */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              টেক্সটের রঙ পছন্দ করুন:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_COLORS.map((col) => {
                const isSelected = cardState.textColor === col.value;
                return (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => onUpdateCardState({ textColor: col.value })}
                    className={`flex items-center space-x-2 p-2 rounded-xl border text-xs text-left transition ${
                      isSelected
                        ? "bg-slate-800 border-amber-400 text-slate-100"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm flex-shrink-0"
                      style={{ backgroundColor: col.value }}
                    />
                    <span className="truncate">{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size Scale */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>ফন্টের সাইজ স্কেল:</span>
              <span className="text-amber-400">
                {Math.round((cardState.fontSizeScale || 1.0) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.85"
              max="1.25"
              step="0.05"
              value={cardState.fontSizeScale || 1.0}
              onChange={(e) =>
                onUpdateCardState({ fontSizeScale: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Event Year Tag Toggle */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200">হিজরি ও সাল প্রদর্শন</p>
              <p className="text-[11px] text-slate-400">কার্ডের নিচের অংশে সাল ট্যাগ দেখাবে</p>
            </div>
            <input
              type="checkbox"
              checked={cardState.showYearTag !== false}
              onChange={(e) => onUpdateCardState({ showYearTag: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* PRIMARY ACTION BUTTONS */}
      <div className="pt-2 space-y-3">
        {/* Main High-Res Download Button */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className={`w-full py-3.5 px-5 rounded-2xl font-bold text-slate-950 text-base shadow-xl flex items-center justify-center space-x-2.5 transition-all duration-300 transform active:scale-95 cursor-pointer ${
            isDownloading
              ? "bg-amber-400/80 cursor-wait"
              : "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/25 shadow-amber-500/15"
          }`}
        >
          {isDownloading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-slate-950"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>কার্ড তৈরি ও ডাউনলোড হচ্ছে...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-slate-950"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>কার্ড ডাউনলোড করুন (HD Image)</span>
            </>
          )}
        </button>

        {/* Secondary Buttons Row: Share, QR, Sample Fill, Reset */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center justify-center space-x-1.5 transition active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 text-sky-400"
            >
              <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.474l6.733-3.366A2.52 2.52 0 0 1 13 4.5Z" />
            </svg>
            <span>শেয়ার</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQR(!showQR)}
            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition active:scale-95 ${
              showQR
                ? "bg-amber-500/20 text-amber-300 border-amber-400/50"
                : "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80"
            }`}
          >
            <span>📱</span>
            <span>QR কোড</span>
          </button>

          <button
            type="button"
            onClick={onFillSample}
            className="py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center justify-center space-x-1.5 transition active:scale-95"
            title="নমুনা তথ্য দিয়ে স্বয়ংক্রিয়ভাবে কার্ড পূরণ করুন"
          >
            <span>✨</span>
            <span>নমুনা তথ্য</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-red-500/10 text-slate-300 hover:text-red-300 border border-slate-700/80 hover:border-red-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition active:scale-95"
            title="কার্ডের সকল তথ্য মুছে নতুন করে শুরু করুন"
          >
            <span>🔄</span>
            <span>রিসেট</span>
          </button>
        </div>

        {/* QR Code Container Modal / View */}
        {showQR && (
          <div className="p-4 bg-slate-900/95 rounded-2xl border border-amber-500/30 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-amber-300">কার্ড স্ক্যান কিউআর কোড</p>
              <button
                type="button"
                onClick={() => setShowQR(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ✕ বন্ধ করুন
              </button>
            </div>
            <QRCodeGenerator
              name={cardState.senderName}
              note={cardState.note}
              templateId={currentTemplateIndex + 1}
            />
          </div>
        )}
      </div>
    </div>
  );
}
