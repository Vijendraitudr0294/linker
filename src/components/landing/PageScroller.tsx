import { useEffect, useState, type MouseEvent } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

const PageScroller = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const next = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      setScrollProgress(Math.min(1, Math.max(0, next)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollByViewport = (direction: "up" | "down") => {
    const amount = Math.max(360, Math.round(window.innerHeight * 0.75));
    window.scrollBy({ top: direction === "up" ? -amount : amount, behavior: "smooth" });
  };

  const jumpToFromTrack = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / rect.height;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: Math.max(0, Math.min(1, ratio)) * maxScroll, behavior: "smooth" });
  };

  const thumbHeight = 96;
  const trackHeight = Math.max(220, window.innerHeight - 32);
  const thumbTravel = trackHeight - thumbHeight;
  const thumbOffset = thumbTravel * scrollProgress;

  return (
    <div className="fixed right-0 top-0 bottom-0 z-[70] hidden md:flex flex-col items-center justify-center">
      <button
        onClick={() => scrollByViewport("up")}
        aria-label="Scroll up"
        className="h-6 w-6 rounded-t-md bg-[#4a4a4a] text-[#b8b8b8] hover:text-white transition-colors flex items-center justify-center"
      >
        <ArrowUp className="w-3 h-3" />
      </button>

      <div className="w-6 h-[calc(100vh-32px)] bg-[#2f2f2f] border-x border-black/25 px-[4px] py-2">
        <div
          onClick={jumpToFromTrack}
          className="relative w-full rounded-full bg-[#242424] cursor-pointer"
          style={{ height: "100%" }}
          aria-label="Scroll track"
        >
          <div
            className="absolute left-0.5 right-0.5 rounded-full bg-[#d9d9d9] shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]"
            style={{ height: thumbHeight, transform: `translateY(${thumbOffset}px)` }}
          />
        </div>
      </div>

      <button
        onClick={() => scrollByViewport("down")}
        aria-label="Scroll down"
        className="h-6 w-6 rounded-b-md bg-[#4a4a4a] text-[#b8b8b8] hover:text-white transition-colors flex items-center justify-center"
      >
        <ArrowDown className="w-3 h-3" />
      </button>
    </div>
  );
};

export default PageScroller;
