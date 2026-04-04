import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, ArrowRight, Sparkles, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

export default function BusinessAIBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Hero Section Box */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl shadow-2xl shadow-primary/30 border border-primary/10 hover:shadow-3xl hover:shadow-primary/40 transition-shadow duration-300"
          >
            <div className="relative h-[320px] sm:h-[360px] md:h-[400px] lg:h-[360px]">
              <img
                src={heroBanner}
                alt="KodeQuantum professionals"
                className="absolute inset-0 h-full w-full object-cover object-center-bottom"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

              <div className="container relative mx-auto flex h-full items-center px-8 py-8">
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-xl"
                >
                  <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <TrendingUp className="h-3.5 w-3.5" /> #1 Local Services Platform
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-medium text-yellow-300 backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-yellow-300" /> 4.8 Rating
                    </span>
                  </div>

                  <h2 className="mb-2 sm:mb-3 text-xl font-bold leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl" style={{ lineHeight: 1.1 }}>
                    Grow Your Business with Servixen
                  </h2>
                  <p className="mb-4 sm:mb-6 max-w-md text-xs sm:text-sm text-white/75 md:text-base">
                    Whether you're a service provider looking to expand or a customer seeking quality — Servixen connects you instantly.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button size="sm" className="gradient-primary border-0 shadow-lg sm:size-default w-full sm:w-auto" asChild>
                      <Link to="/signup?role=provider">
                        List Your Business <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:size-default w-full sm:w-auto"
                      asChild
                    >
                      <Link to="/services">Explore Services</Link>
                    </Button>
                  </div>

                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-white/60">
                    <span>✓ Free to join</span>
                    <span>✓ Verified pros</span>
                    <span>✓ 24/7 support</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* AI Business Box */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 p-8 shadow-2xl shadow-accent/30 border border-accent/10 min-h-[360px] flex flex-col justify-center hover:shadow-3xl hover:shadow-accent/40 transition-shadow duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Bot className="h-8 w-8" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3 w-3" /> AI-Powered
                </span>
                <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-1 text-xs font-medium text-accent-foreground">
                  <TrendingUp className="h-3 w-3" /> Smart Business
                </span>
              </div>
            </div>

            <h3 className="mb-3 text-xl font-bold leading-tight text-foreground sm:text-2xl">
              Try Business Using AI
            </h3>
            <p className="mb-6 text-base text-muted-foreground sm:text-lg">
              Leverage AI to grow your business faster. Get intelligent insights, automated marketing, and smart customer engagement.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button size="sm" className="gradient-primary border-0 shadow-sm sm:size-default" asChild>
                <Link to="/start-with-ai">
                  Start with AI <ArrowRight className="ml-1 h-3 w-3 sm:ml-2 sm:h-4 sm:w-4" />
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 sm:size-default"
                asChild
              >
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}