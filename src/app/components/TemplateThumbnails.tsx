"use client";

import { useState } from "react";
import Image from "next/image";
import { Template } from "../lib/templates";

interface TemplateThumbnailsProps {
  templates: Template[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export default function TemplateThumbnails({
  templates,
  currentIndex,
  onSelect,
}: TemplateThumbnailsProps) {
  const [filter, setFilter] = useState<"all" | "exclusive" | "classic">("all");

  const filteredTemplates = templates
    .map((template, originalIndex) => ({ template, originalIndex }))
    .filter(({ template }) => {
      if (filter === "all") return true;
      return template.category === filter;
    });

  return (
    <div className="space-y-3.5">
      {/* Header & Category Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
          <span className="text-amber-400">❖</span>
          <span>ফ্রেম ও টেমপ্লেট নির্বাচন করুন:</span>
        </label>

        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === "all"
                ? "bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            সবগুলো ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("exclusive")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === "exclusive"
                ? "bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            এক্সক্লুসিভ ✨
          </button>
          <button
            type="button"
            onClick={() => setFilter("classic")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === "classic"
                ? "bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ক্লাসিক
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Thumbnails List */}
      <div className="flex overflow-x-auto space-x-3.5 pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-900">
        {filteredTemplates.map(({ template, originalIndex }) => {
          const isSelected = originalIndex === currentIndex;
          return (
            <button
              key={template.id || originalIndex}
              type="button"
              onClick={() => onSelect(originalIndex)}
              className={`flex-shrink-0 group relative flex flex-col items-center rounded-2xl p-1.5 transition-all duration-200 text-left cursor-pointer focus:outline-none ${
                isSelected
                  ? "bg-gradient-to-b from-amber-500/20 to-emerald-500/10 border-2 border-amber-400 shadow-lg shadow-amber-500/10 scale-[1.02]"
                  : "bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60"
              }`}
            >
              {/* Badge */}
              {template.badge && (
                <span className="absolute -top-2 left-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow">
                  {template.badge}
                </span>
              )}

              {/* Thumbnail Image */}
              <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-xl overflow-hidden bg-slate-950 relative border border-slate-800/80">
                <Image
                  src={template.thumbnail || template.path}
                  alt={template.name}
                  width={200}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />

                {/* Selected Checkmark Overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-amber-500/15 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Template Name */}
              <div className="mt-1.5 px-1 max-w-[110px] text-center">
                <p
                  className={`text-xs font-medium truncate ${
                    isSelected ? "text-amber-300" : "text-slate-300 group-hover:text-slate-100"
                  }`}
                  title={template.name}
                >
                  {template.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
