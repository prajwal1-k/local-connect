import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight, Star, CheckCircle, Clock, Shield, Home, Sparkles, SprayCan, Settings, Monitor, Paintbrush, Truck, BookOpen, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import HomeCarousel from "@/components/HomeCarousel";
import HeroServicesCarousel from "@/components/HeroServicesCarousel";
import GrowSection from "@/components/GrowSection";
import HeroBanner from "@/components/HeroBanner";

const iconMap: Record<string, React.ReactNode> = {
  home: <Home className="h-8 w-8" />,
  sparkles: <Sparkles className="h-8 w-8" />,
  "spray-can": <SprayCan className="h-8 w-8" />,
  settings: <Settings className="h-8 w-8" />,
  monitor: <Monitor className="h-8 w-8" />,
  paintbrush: <Paintbrush className="h-8 w-8" />,
  truck: <Truck className="h-8 w-8" />,
  "book-open": <BookOpen className="h-8 w-8" />,
  wrench: <Settings className="h-8 w-8" />,
};

const steps = [
  { icon: <Search className="h-10 w-10" />, title: "Search", desc: "Find the service you need from our wide range of categories" },
  { icon: <CheckCircle className="h-10 w-10" />, title: "Book", desc: "Send a request to a trusted professional near you" },
  { icon: <Star className="h-10 w-10" />, title: "Get Service", desc: "Get quality service at your doorstep and rate the experience" },
];

export default function Index() {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => setCategories(data || []));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/services?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <span className="text-lg font-bold text-primary-foreground">K</span>
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              LocalConnect
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Services
            </Link>
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to={role === "service_provider" ? "/provider-dashboard" : "/dashboard"} className="text-sm font-medium px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors">
                  Dashboard
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut()} className="text-sm font-semibold">
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="text-sm font-semibold px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                About
              </Link>
              <Link
                to="/contact"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                Contact
              </Link>
              <Link
                to="/services"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >

                <Search className="h-4 w-4" />
                Browse Services
              </Link>
              {user && (
                <Link
                  to={role === "service_provider" ? "/provider-dashboard" : "/dashboard"}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
              <div className="pt-2 mt-3 border-t border-border/50">
                {user ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 text-sm font-semibold"
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  >
                    <ArrowRight className="h-4 w-4" />
                    Log out
                  </Button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ArrowRight className="h-4 w-4" />
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-colors shadow-sm mt-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Star className="h-4 w-4" />
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Top Banner Ad */}
      <HeroBanner />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="text-center md:text-left">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  Trusted by 10,000+ users
                </span>
                <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:mx-0 md:text-6xl">
                  Find Trusted <span>Local Services</span> Near You
                </h1>
                <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground md:mx-0">
                  Connect with verified professionals for home services, beauty, IT support, and more. Quality service at your doorstep.
                </p>
              </motion.div>

              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mx-auto flex max-w-lg gap-2 md:mx-0"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search for plumber, electrician, tutor..."
                    className="h-12 pl-10 text-base shadow-card"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-6 gradient-primary border-0">
                  Search
                </Button>
              </motion.form>
            </div>

            <div>
              <HeroServicesCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">Popular Services</h2>
            <p className="text-muted-foreground">Browse from our wide range of professional services</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link to={`/services?category=${cat.id}`}>
                  <Card className="group cursor-pointer border-0 shadow-card transition-all hover:shadow-elevated hover:-translate-y-1">
                    <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:gradient-primary group-hover:text-primary-foreground">
                        {iconMap[cat.icon] || <Settings className="h-8 w-8" />}
                      </div>
                      <h3 className="font-semibold">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Carousel */}
      <HomeCarousel />

      {/* How it works */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="text-muted-foreground">Get started in 3 simple steps</p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary text-primary-foreground">
                  {step.icon}
                </div>
                <span className="mb-1 text-sm font-medium text-primary">Step {i + 1}</span>
                <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {[
              { icon: <Shield className="h-7 w-7" />, title: "Verified Professionals", desc: "All service providers are verified and trusted" },
              { icon: <Clock className="h-7 w-7" />, title: "Quick Response", desc: "Get responses within minutes from nearby pros" },
              { icon: <Star className="h-7 w-7" />, title: "Rated & Reviewed", desc: "Choose based on real customer ratings and reviews" },
            ].map((item, i) => (
              <Card key={i} className="border-0 shadow-card">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Grow Section */}
      <GrowSection />

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-2xl gradient-primary p-10 text-center text-primary-foreground md:p-16">
            <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mb-8 opacity-90">Join thousands of happy customers and trusted service providers</p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/signup">Sign Up as Customer <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" className="gradient-primary border-0 text-primary-foreground hover:opacity-90" asChild>
                <Link to="/signup?role=provider">Join as Provider</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

{/* Footer */}
<footer className="relative mt-14 sm:mt-20">
  {/* Glass Container */}
  <div className="relative mx-4 overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 dark:bg-white/5 border border-white/10 sm:mx-0">
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />
    <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
      
      {/* Top Section */}
      <div className="grid grid-cols-2 gap-8 text-center sm:gap-10 sm:text-left md:grid-cols-3">
        
        {/* Brand */}
        <div className="col-span-2 flex flex-col items-center sm:items-start gap-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-primary shadow-lg">
              <span className="text-sm font-bold text-white">K</span>
            </div>
            <span className="text-lg font-semibold text-foreground">
              KodeQuantum
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Smart local services platform connecting you with trusted professionals near you.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col items-center sm:items-start gap-2">
          <h4 className="font-semibold text-foreground mb-2">Quick Links</h4>
          {["Home", "Services", "About", "Contact"].map((item) => (
            <a
              key={item}
              href="#"
              className="relative group py-1 text-muted-foreground transition-colors"
            >
              <span className="group-hover:text-foreground">{item}</span>
              <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-primary transition-all group-hover:w-full"></span>
            </a>
          ))}
        </div>

        {/* Social */}
        <div className="flex flex-col items-center sm:items-start gap-3">
          <h4 className="font-semibold text-foreground">Connect</h4>

          <div className="flex gap-2 sm:gap-4">
            {["🌐", "🐦", "💼", "📸"].map((icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 hover:scale-110 transition-all shadow-sm"
              >
                {icon}
              </a>
            ))}
          </div>

          <p className="text-sm text-muted-foreground text-center sm:text-left">
            support@kodequantum.com
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-white/10 sm:my-8" />

      {/* Bottom */}
      <div className="flex flex-col items-center gap-3 text-xs text-muted-foreground sm:gap-4 sm:text-sm sm:flex-row sm:justify-between">
        <p>© 2026 KodeQuantum. All rights reserved.</p>

        <div className="flex flex-wrap justify-center gap-4">
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </div>

  {/* Glow Effect */}
  <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-primary/10 via-transparent to-transparent blur-2xl"></div>
</footer>
    </div>
  );
}

