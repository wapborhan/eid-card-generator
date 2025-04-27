import { useState, useEffect, useRef } from "react";
import { Template } from "../lib/templates";

interface CardPreviewProps {
  template: Template;
  name: string;
  note: string;
  onSvgGenerated: (svgContent: string) => void;
}

export default function CardPreview({
  template,
  name,
  note,
  onSvgGenerated,
}: CardPreviewProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    const fetchAndProcessSvg = async () => {
      try {
        const response = await fetch(template.path);
        if (!response.ok) throw new Error("Failed to fetch SVG");
        const svgText = await response.text();

        // Process the SVG with name and note
        const processedSvg = await processSvg(
          svgText,
          name,
          note,
          template.color
        );
        setSvgContent(processedSvg);
        onSvgGenerated(processedSvg); // Call the callback with the generated SVG
      } catch (error) {
        console.error("Error loading SVG:", error);
        setSvgContent(
          '<div class="text-red-500 p-4">Error loading template</div>'
        );
      }
    };

    fetchAndProcessSvg();
  }, [template, name, note, onSvgGenerated]);

  const processSvg = async (
    svgString: string,
    name: string,
    note: string,
    color: string
  ): Promise<string> => {
    try {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
      const svgElement = svgDoc.querySelector("svg");

      if (!svgElement) {
        throw new Error("Invalid SVG content");
      }

      // Clear previous custom text if any
      const existingTexts = svgElement.querySelectorAll(".custom-text");
      existingTexts.forEach((text) => text.remove());

      // Get dimensions
      let width = 500,
        height = 800;
      const viewBox = svgElement.getAttribute("viewBox");
      if (viewBox) {
        const [, , w, h] = viewBox.split(/\s+|,/).map(Number);
        if (w && h) {
          width = w;
          height = h;
        }
      }

      // Add name if exists
      if (name.trim()) {
        const nameYPosition = height - height * 0.05;
        const nameFontSize = height * 0.037;
        const nameElement = svgDoc.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );

        nameElement.setAttribute("x", (width / 2).toString());
        nameElement.setAttribute("y", nameYPosition.toFixed(2));
        nameElement.setAttribute("text-anchor", "middle");
        nameElement.setAttribute("font-family", "banglaFont");
        nameElement.setAttribute("font-size", nameFontSize.toFixed(2));
        nameElement.setAttribute("fill", color);
        nameElement.setAttribute("font-weight", "500");
        nameElement.textContent = name;
        nameElement.classList.add("custom-text");

        svgElement.appendChild(nameElement);
      }

      // Add note if exists
      if (note.trim()) {
        const noteFontSize = height * 0.035;
        const noteLines = note.split("\n");
        const nameYPosition = height - height * 0.05;
        const noteYStart =
          nameYPosition - noteLines.length * noteFontSize * 1.2 - height * 0.05;

        noteLines.forEach((textLine, index) => {
          const noteElement = svgDoc.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          const lineYPosition = noteYStart + index * noteFontSize * 1.2;

          noteElement.setAttribute("x", (width / 2).toString());
          noteElement.setAttribute("y", lineYPosition.toFixed(2));
          noteElement.setAttribute("text-anchor", "middle");
          noteElement.setAttribute("font-family", "banglaFont");
          noteElement.setAttribute("font-size", noteFontSize.toFixed(2));
          noteElement.setAttribute("fill", color);
          noteElement.setAttribute("font-weight", "400");
          noteElement.textContent = textLine;
          noteElement.classList.add("custom-text");

          svgElement.appendChild(noteElement);
        });
      }

      // Add font-face if not exists
      if (!svgDoc.querySelector("style")) {
        const styleElement = svgDoc.createElementNS(
          "http://www.w3.org/2000/svg",
          "style"
        );
        styleElement.textContent = `
          @font-face {
            font-family: 'banglaFont';
            src: url('/assets/banglaFont.woff2') format('woff2');
          }
        `;
        svgElement.insertBefore(styleElement, svgElement.firstChild);
      }

      // Serialize back to string
      const serializer = new XMLSerializer();
      return serializer.serializeToString(svgDoc.documentElement);
    } catch (error) {
      console.error("Error processing SVG:", error);
      throw error;
    }
  };

  return (
    <div className="w-full relative " id="cardPreviewContainer">
      <div
        ref={svgContainerRef}
        id="svgContainer"
        className="w-[85%] h-full shadow-xl banglaFont"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}
