import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[420px] md:h-[480px]">
        <img
          src={heroBanner}
          alt="KodeQuantum professionals"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        <div className="container relative mx-auto flex h-full items-center px-4">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <TrendingUp className="h-3.5 w-3.5" /> #1 Local Services Platform
              </span>
              <span className="flex items-center gap-1 rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-medium text-yellow-300 backdrop-blur-sm">
                <Star className="h-3 w-3 fill-yellow-300" /> 4.8 Rating
              </span>
            </div>

            <h2 className="mb-3 text-3xl font-bold leading-tight text-white md:text-5xl" style={{ lineHeight: 1.1 }}>
              Grow Your Business with LocalConnect
            </h2>
            <p className="mb-6 max-w-md text-sm text-white/75 md:text-base">
              Whether you're a service provider looking to expand or a customer seeking quality — KodeQuantum connects you instantly.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gradient-primary border-0 shadow-lg" asChild>
                <Link to="/signup?role=provider">
                  List Your Business <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                asChild
              >
                <Link to="/services">Explore Services</Link>
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-6 text-xs text-white/60">
              <span>✓ Free to join</span>
              <span>✓ Verified pros</span>
              <span>✓ 24/7 support</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
