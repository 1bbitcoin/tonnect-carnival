import { useEffect, useState } from "react";
import tonnectLogo from "@/assets/new-tonnect-logo.png";
import tonnect2026 from "@/assets/tonnect-2026.png";

interface Slide {
  id: string;
  bg: string; // tailwind/css background classes or gradient
  content: React.ReactNode;
}

const slides: Slide[] = [
  {
    id: "tonnect",
    bg: "bg-gradient-to-br from-[hsl(210,100%,62%)] via-[hsl(205,95%,55%)] to-[hsl(215,90%,48%)]",
    content: (
      <div className="relative w-full text-center py-10 px-6 overflow-hidden">
        {/* subtle network lines accent */}
        <div className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 rounded-full border border-white/20" />
        <div className="pointer-events-none absolute -top-2 -right-2 w-20 h-20 rounded-full border border-white/15" />

        <h1
          style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.08em" }}
          className="text-5xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
        >
          TONNECT
        </h1>
        <p
          style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em" }}
          className="mt-2 text-base font-semibold text-white/95 uppercase"
        >
          Mining Carnival
        </p>

        <div className="mt-4 inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-lg">
          <img src={tonnectLogo} alt="TONNECT" className="w-5 h-5 rounded-full" />
          <span className="text-xs font-bold text-[hsl(210,90%,50%)]">TON</span>
          <span className="text-[hsl(210,40%,70%)]">|</span>
          <span className="text-xs font-bold text-[hsl(210,90%,50%)]">Telegram</span>
        </div>
      </div>
    ),
  },
  {
    id: "tonnect-2026",
    // Background menyesuaikan warna gambar (biru terang)
    bg: "bg-gradient-to-br from-[hsl(210,100%,60%)] via-[hsl(205,95%,55%)] to-[hsl(215,90%,50%)]",
    content: (
      <div className="w-full">
        <img
          src={tonnect2026}
          alt="TONNECT 2026 - Connecting Everyone To Crypto"
          className="w-full h-full object-cover"
        />
      </div>
    ),
  },
];

const HeroCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl cyber-card">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s) => (
          <div
            key={s.id}
            className={`min-w-full ${s.bg} flex items-center justify-center`}
          >
            {s.content}
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;