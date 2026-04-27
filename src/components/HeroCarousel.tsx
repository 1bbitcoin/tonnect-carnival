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
    bg: "bg-gradient-to-br from-[hsl(220,100%,97%)] via-[hsl(230,100%,96%)] to-[hsl(260,80%,95%)]",
    content: (
      <div className="text-center space-y-3 py-6">
        <div className="flex justify-center">
          <img
            src={tonnectLogo}
            alt="TONNECT Logo"
            className="w-24 h-24 rounded-full animate-glow-pulse"
          />
        </div>
        <h1 className="text-4xl font-bold glow-text">TONNECT</h1>
        <p className="text-lg text-accent">Mining Carnival</p>
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