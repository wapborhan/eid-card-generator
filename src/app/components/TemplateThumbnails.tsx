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
  return (
    <div>
      <label className="text-xl font-abu-sayed text-gray-700">টেমপ্লেট:</label>
      <div className="flex overflow-x-auto space-x-4 py-3 px-2 scrollbar-hide">
        {templates.map((template, index) => (
          <Image
            key={index}
            width={1000}
            height={1000}
            src={template.thumbnail || template.path}
            alt={`Template ${index + 1}`}
            className={`template-thumbnail w-24 h-24 rounded-xl cursor-pointer hover:scale-105 hover:shadow-md transition transform object-cover border-2 ${
              index === currentIndex
                ? "border-gray-800 scale-105 shadow-md"
                : "border-gray-300"
            }`}
            onClick={() => onSelect(index)}
          />
        ))}
      </div>
    </div>
  );
}
