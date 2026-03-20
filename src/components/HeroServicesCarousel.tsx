import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import slideRepairs from "@/assets/b2b.jpeg";
import slideB2B from "@/assets/it-consultant.jpeg";
import slideDoctors from "@/assets/home-service.jpeg";

type Slide = {
  image: string;
  alt: string;
};

const HERO_SLIDES: Slide[] = [
  { image: slideRepairs, alt: "Home repairs" },

  { image: slideB2B, alt: "B2B solutions" },
  { image: slideDoctors, alt: "Healthcare" },
];

export default function HeroServicesCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const slides = useMemo(() => HERO_SLIDES, []);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next]);

  const variants = useMemo(
    () => ({
      enter: (d: number) => ({ x: d > 0 ? 260 : -260, opacity: 0 }),
      center: { x: 0, opacity: 1 },
      exit: (d: number) => ({ x: d > 0 ? -260 : 260, opacity: 0 }),
    }),
    [],
  );

  return (
    <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl shadow-elevated">
      <div className="relative aspect-[4/3]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <img
              src={slides[current].image}
              alt={slides[current].alt}
              className="h-full w-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

