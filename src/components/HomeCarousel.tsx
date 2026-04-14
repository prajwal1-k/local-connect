import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import slideRepairs from "@/assets/slide-repairs.jpg";
import slideB2B from "@/assets/slide-b2b.jpg";
import slideDoctors from "@/assets/slide-doctors.jpg";
import slideRealEstate from "@/assets/slide-realestate.jpg";
import slideServices from "@/assets/slide-services.jpg";
import slideTutorials from "@/assets/online-tutoing.png";
import slideITConsulting from "@/assets/it-consultant.jpeg";
import slideDigitalMarketing from "@/assets/digital-marketing.png";

const slides = [
  {
    image: slideRepairs,
    title: "Home Repairs",
    desc: "Plumbing, electrical, carpentry — trusted pros at your doorstep",
  },
  {
    image: slideServices,
    title: "Cleaning Services",
    desc: "Professional cleaning for homes and offices",
  },
  {
    image: slideB2B,
    title: "B2B Solutions",
    desc: "Connect with business service providers for your company needs",
  },
  {
    image: slideDoctors,
    title: "Healthcare",
    desc: "Find doctors, therapists and wellness experts near you",
  },
  {
    image: slideRealEstate,
    title: "Real Estate",
    desc: "Property listings, agents and home inspection services",
  },
  {
    image: slideTutorials,
    title: "Online Tutoring",
    desc: "Connect with expert tutors for personalized learning",
  },
  {
    image: slideITConsulting,
    title: "IT Consulting",
    desc: "Expert IT consulting for businesses of all sizes",
  },
  {
    image: slideDigitalMarketing,
    title: "Digital Marketing",
    desc: "Boost your online presence with our marketing pros",
  }

];

export default function HomeCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            Explore Our Services
          </h2>
          <p className="text-muted-foreground">
            From home repairs to healthcare — we've got you covered
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-elevated">
          <div className="relative aspect-[3/2]">
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
                  alt={slides[current].title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">
                    {slides[current].title}
                  </h3>
                  <p className="text-sm text-white/80 md:text-base">
                    {slides[current].desc}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <Button
            variant="ghost"
            size="icon"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40 h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40 h-10 w-10"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
