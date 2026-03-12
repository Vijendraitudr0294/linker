import { useState, useRef } from "react";
import { Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EMOJI_CATEGORIES = [
  { label: "😊", emojis: ["😊", "😄", "😎", "🤩", "😍", "🥰", "😇", "🤗", "😏", "🤔", "😌", "🥳", "😂", "🤣", "😢", "😭"] },
  { label: "👋", emojis: ["👋", "👍", "👏", "🙌", "✌️", "🤝", "💪", "🙏", "☝️", "👆", "✋", "🤙", "🫶", "❤️", "🔥", "⭐"] },
  { label: "🎵", emojis: ["🎵", "🎶", "🎤", "🎸", "🎹", "🥁", "🎺", "📸", "🎬", "🎨", "🎭", "✨", "💫", "🌟", "💡", "🚀"] },
  { label: "💼", emojis: ["💼", "📧", "📱", "💻", "🖥️", "📊", "📈", "🏆", "🎯", "💰", "🛒", "🏠", "🌍", "✈️", "🍕", "☕"] },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const EmojiPicker = ({ onSelect }: EmojiPickerProps) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-2 rounded-md hover:bg-muted transition-colors"
          title="Add emoji"
        >
          <Smile className="w-4 h-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="flex gap-1 mb-2 border-b border-border pb-2">
          {EMOJI_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`text-lg px-2 py-1 rounded transition-colors ${activeTab === i ? "bg-muted" : "hover:bg-muted/50"}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_CATEGORIES[activeTab].emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="text-lg p-1 rounded hover:bg-muted transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
