import { useRef, useState } from "react";
import QRCodeGenerator from "./QRCodeGenerator";

interface ControlsProps {
  name: string;
  note: string;
  onNameChange: (name: string) => void;
  onNoteChange: (note: string) => void;
  currentTemplateIndex: number;
  svgContent?: string;
}

export default function Controls({
  name,
  note,
  onNameChange,
  onNoteChange,
  currentTemplateIndex,
  svgContent = "",
}: ControlsProps) {
  const [showQR, setShowQR] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  const handleDownload = async () => {
    if (!svgContent) {
      alert("Card is not ready for download yet. Please wait.");
      return;
    }
    setIsDownloading(true);
    try {
      // Create a temporary container to parse the SVG
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = svgContent;
      const svgElement = tempDiv.querySelector("svg");

      if (!svgElement) {
        throw new Error("Could not parse SVG content");
      }

      // Get the SVG's intrinsic dimensions
      let width = 1000; // Default fallback width
      let height = 1600; // Default fallback height

      // Try to get dimensions from viewBox first
      const viewBox = svgElement.getAttribute("viewBox");
      if (viewBox) {
        const parts = viewBox.split(/\s+|,/).filter(Boolean);
        if (parts.length >= 4) {
          width = parseFloat(parts[2]) || width;
          height = parseFloat(parts[3]) || height;
        }
      } else {
        // Fallback to width/height attributes
        const widthAttr = svgElement.getAttribute("width");
        const heightAttr = svgElement.getAttribute("height");
        width = widthAttr ? parseFloat(widthAttr) : width;
        height = heightAttr ? parseFloat(heightAttr) : height;
      }

      // Create canvas with high DPI (4x for retina quality)
      const scale = 4; // Increase this for even higher quality
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Create SVG blob
      const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Load SVG as image
      const img = new Image();
      img.onload = () => {
        try {
          // Scale and draw the image
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0, width, height);

          // Create download link
          if (downloadLinkRef.current) {
            downloadLinkRef.current.href = canvas.toDataURL("image/png", 1.0); // Highest quality
            downloadLinkRef.current.download = `eid-card-${
              name || "anonymous"
            }-${Date.now()}.png`;
            downloadLinkRef.current.click();
          }

          URL.revokeObjectURL(svgUrl);
        } catch (error) {
          console.error("Error during image processing:", error);
          alert("Error generating the card image. Please try again.");
        } finally {
          setIsDownloading(false); // Reset downloading state
        }
      };

      img.onerror = () => {
        console.error("Error loading SVG image");
        alert("Error loading the card image. Please try again.");
        URL.revokeObjectURL(svgUrl);
        setIsDownloading(false);
      };

      img.src = svgUrl;
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download the card. Please try again.");
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    if (!name) {
      alert("Please enter your name before sharing.");
      return;
    }

    const shareUrl = `${window.location.origin}/?name=${encodeURIComponent(
      name
    )}&id=${currentTemplateIndex + 1}${
      note ? `&note=${encodeURIComponent(note)}` : ""
    }`;

    if (navigator.share) {
      navigator
        .share({
          title: "Eid Mubarak Card",
          text: "Check out this Eid card I created!",
          url: shareUrl,
        })
        .catch((err) => {
          console.error("Share failed:", err);
          copyToClipboard(shareUrl);
        });
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Share link copied to clipboard!"))
      .catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("Share link copied to clipboard!");
      });
  };
  return (
    <div className="flex flex-col space-y-6">
      <a ref={downloadLinkRef} className="hidden" aria-hidden="true" />
      <div>
        <label className="text-xl font-abu-sayed text-gray-700">
          আপনার নাম:
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="নিজের নাম লিখুন"
          maxLength={50}
          className="w-full px-4 py-3 rounded-xl bg-white/50 text-gray-800 placeholder-gray-500  focus:outline-none transition-all duration-300 border-[1.5px] border-gray-700 focus:border-pink-600"
        />
      </div>
      <div>
        <label className="text-xl font-abu-sayed text-gray-700">
          আপনার নোট:
        </label>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="আপনার নোট লিখুন"
          maxLength={100}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white/50 text-gray-800 placeholder-gray-500  focus:outline-none transition-all duration-300 border-[1.5px] border-gray-700 focus:border-pink-600"
        />
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`w-full bg-gray-700 hover:bg-gray-600 text-white font-abu-sayed py-3 px-4 rounded-xl text-md transition-colors duration-300 flex items-center justify-center space-x-2 ${
            isDownloading ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isDownloading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>ডাউনলোডিং...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>ডাউনলোড</span>
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-abu-sayed text-md transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z"
              clipRule="evenodd"
            />
          </svg>
          <span>শেয়ার</span>
        </button>

        <button
          onClick={() => setShowQR(!showQR)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-abu-sayed text-md transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
            />
          </svg>
        </button>
      </div>

      {showQR && (
        <QRCodeGenerator
          name={name}
          note={note}
          templateId={currentTemplateIndex + 1}
        />
      )}
    </div>
  );
}
