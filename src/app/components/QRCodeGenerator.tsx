import { useEffect, useRef } from "react";
import QRious from "qrious";

interface QRCodeGeneratorProps {
  name: string;
  note: string;
  templateId: number;
}

export default function QRCodeGenerator({
  name,
  note,
  templateId,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!name || !canvasRef.current) return;

    const shareUrl = `${window.location.origin}?name=${encodeURIComponent(
      name
    )}&id=${templateId}${note ? `&note=${encodeURIComponent(note)}` : ""}`;

    // Create without element first
    const qr = new QRious({
      value: shareUrl,
      size: 250,
      level: "H",
      padding: 20,
      foreground: "#333333",
    });

    // Then set the canvas element
    if (canvasRef.current) {
      canvasRef.current.getContext("2d")?.drawImage(qr.canvas, 0, 0);
    }
  }, [name, note, templateId]);

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = `eid-card-${name || "anonymous"}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-white rounded-lg shadow-md">
      <canvas
        ref={canvasRef}
        width={250}
        height={250}
        className="border border-gray-200"
      />
      <button
        onClick={handleDownload}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Download QR Code
      </button>
    </div>
  );
}
