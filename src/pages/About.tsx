import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Target, Award, Heart, CheckCircle, Star, TrendingUp, Globe, Clock, Shield, Menu, X, Home, BookOpen, Settings, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    icon: <Users className="h-8 w-8" />,
    title: "Community First",
    desc: "We believe in building strong local communities by connecting people with trusted service providers in their area.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: "Quality Assurance",
    desc: "Every service provider on our platform undergoes rigorous verification to ensure they meet our high standards.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "Excellence",
    desc: "We strive for excellence in every interaction, from booking to service delivery and customer support.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Customer Satisfaction",
    desc: "Your satisfaction is our top priority. We work tirelessly to ensure every experience exceeds expectations.",
    color: "from-red-500 to-orange-500"
  }
];

const stats = [
  { number: "15,000+", label: "Happy Customers", icon: <Users className="h-6 w-6" />, color: "text-blue-500" },
  { number: "3,200+", label: "Verified Providers", icon: <Shield className="h-6 w-6" />, color: "text-green-500" },
  { number: "75+", label: "Service Categories", icon: <Globe className="h-6 w-6" />, color: "text-purple-500" },
  { number: "4.9/5", label: "Average Rating", icon: <Star className="h-6 w-6" />, color: "text-yellow-500" }
];

export default function About() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              KodeQuantum
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Services
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground transition-colors">
              About Us
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="text-sm font-semibold px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
              Get Started
            </Link>
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
                to="/services"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Search className="h-4 w-4" />
                Services
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                About Us
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Dashboard
              </Link>
              <div className="pt-2 mt-3 border-t border-border/50">
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
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Back to Home */}
      <div className="pt-8 pb-4">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground -ml-2">
            <Link to="/" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              About KodeQuantum
            </span>
            <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              About <span >KodeQuantum</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
              We're revolutionizing local services by connecting customers with verified professionals through technology and trust.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button size="lg" className="gradient-primary border-0" asChild>
                <Link to="/services">Explore Our Services <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/signup?role=provider">Join as Provider</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="mb-4 text-3xl font-bold tracking-tight">Our Story</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Founded in 2026, KodeQuantum was born from a simple idea: local services should be as easy to access as online shopping.
                We noticed that finding trustworthy local professionals was often frustrating and time-consuming.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="h-full border-0 shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <h3 className="mb-4 text-xl font-bold">The Problem</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Customers struggled to find reliable service providers, while professionals had difficulty reaching customers.
                      The traditional methods of finding local services were outdated and inefficient.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full border-0 shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h3 className="mb-4 text-xl font-bold">Our Solution</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We created a platform that verifies professionals, provides transparent pricing, and makes booking services
                      as simple as a few clicks. Our technology ensures quality and builds trust.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="mb-3 text-3xl font-bold tracking-tight">Our Values</h2>
            <p className="text-muted-foreground">The principles that guide everything we do</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="h-full border-0 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 group bg-gradient-to-br from-card to-card/50">
                  <CardContent className="flex flex-col items-center text-center p-6">
                    <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${value.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {value.icon}
                    </div>
                    <h3 className="mb-2 font-semibold text-lg">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="mb-3 text-3xl font-bold tracking-tight">By the Numbers</h2>
            <p className="text-muted-foreground">Our growing community and impact</p>
          </motion.div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center group"
              >
                <Card className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="mb-3 flex justify-center">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                        {stat.icon}
                      </div>
                    </div>
                    <div className="text-2xl font-bold">
                      {stat.number}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-lg">
                  <Target className="h-8 w-8" />
                </div>
              </div>
              <h2 className="mb-6 text-3xl font-bold tracking-tight">Our Mission</h2>
              <p className="mb-8 text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                To empower local communities by creating a trusted marketplace where customers can easily find and book
                quality services, while giving service professionals the tools they need to grow their businesses.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="gradient-primary border-0 hover:opacity-90 transition-opacity" asChild>
                  <Link to="/services">Explore Services <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 transition-colors" asChild>
                  <Link to="/signup?role=provider">Join as Provider</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">K</span>
            </div>
            <span className="font-semibold text-foreground">KodeQuantum Local Services</span>
          </div>
          <p>© 2026 KodeQuantum. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}