"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { templates } from "../lib/templates";
import CardPreview from "./CardPreview";
import TemplateThumbnails from "./TemplateThumbnails";
import Controls from "./Controls";

export default function EidCardGenerator() {
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [svgContent, setSvgContent] = useState(""); // Add state for SVG content
  const searchParams = useSearchParams();

  // Handle URL parameters for shared cards
  useEffect(() => {
    const urlName = searchParams.get("name");
    const templateId = searchParams.get("id");
    const urlNote = searchParams.get("note");

    if (urlName) setName(urlName);
    if (urlNote) setNote(urlNote);
    if (templateId) {
      const index = parseInt(templateId) - 1;
      if (index >= 0 && index < templates.length) {
        setCurrentTemplateIndex(index);
      }
    }
  }, [searchParams]);

  return (
    <div className="bg-gray-100 flex justify-center items-center min-h-screen p-6">
      <div className="glassmorphism p-8 rounded-3xl w-full max-w-4xl flex lg:flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-8 shadow-lg border-2 border-[rgba(255, 255, 255, 0.2)]">
        <div className="w-full md:w-1/2 flex flex-col space-y-6">
          <h1 className="text-3xl text-gray-800 font-abu-sayed text-center tracking-wide">
            ঈদ কার্ড!
          </h1>

          <TemplateThumbnails
            templates={templates}
            currentIndex={currentTemplateIndex}
            onSelect={setCurrentTemplateIndex}
          />

          <Controls
            name={name}
            note={note}
            onNameChange={setName}
            onNoteChange={setNote}
            currentTemplateIndex={currentTemplateIndex}
            svgContent={svgContent} // Pass the SVG content
          />
        </div>
        <CardPreview
          template={templates[currentTemplateIndex]}
          name={name}
          note={note}
          onSvgGenerated={setSvgContent}
          // Pass callback to get SVG content
        />
      </div>
    </div>
  );
}
