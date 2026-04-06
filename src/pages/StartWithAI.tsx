import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  ArrowRight, 
  Sparkles, 
  Search, 
  Zap,
  Clock,
  CheckCircle,
  Star,
  MapPin,
  IndianRupee,
  Loader2,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

// Mock service providers data
const mockProviders = [
  {
    id: 1,
    name: "Pro Plumbing Solutions",
    category: "Plumbing",
    rating: 4.8,
    reviews: 156,
    price: "₹500",
    distance: "2.3 km",
    availability: "Available now",
    image: "🔧",
    match: 98,
    isAIMatch: true,
  },
  {
    id: 2,
    name: "Spark Electricals",
    category: "Electrical",
    rating: 4.9,
    reviews: 203,
    price: "₹600",
    distance: "1.8 km",
    availability: "Today 2:00 PM",
    image: "⚡",
    match: 95,
    isAIMatch: true,
  },
  {
    id: 3,
    name: "Clean Haven Services",
    category: "Cleaning",
    rating: 4.7,
    reviews: 89,
    price: "₹300",
    distance: "3.1 km",
    availability: "Tomorrow 10:00 AM",
    image: "🧹",
    match: 92,
    isAIMatch: false,
  },
  {
    id: 4,
    name: "AC Cooling Experts",
    category: "AC Repair",
    rating: 4.6,
    reviews: 124,
    price: "₹800",
    distance: "2.9 km",
    availability: "Today 4:00 PM",
    image: "❄️",
    match: 88,
    isAIMatch: false,
  },
];

interface AgentStep {
  label: string;
  icon: JSX.Element;
  completed: boolean;
  active: boolean;
}

export default function StartWithAI() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([
    { label: "Finding services", icon: <Search className="h-4 w-4" />, completed: false, active: false },
    { label: "Comparing prices", icon: <IndianRupee className="h-4 w-4" />, completed: false, active: false },
    { label: "Checking trust", icon: <Star className="h-4 w-4" />, completed: false, active: false },
    { label: "AI matching", icon: <Bot className="h-4 w-4" />, completed: false, active: false },
  ]);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowResults(false);
    
    // Simulate AI agent progress
    const steps: AgentStep[] = [
      { label: "Finding services", icon: <Search className="h-4 w-4" />, completed: false, active: true },
      { label: "Comparing prices", icon: <IndianRupee className="h-4 w-4" />, completed: false, active: false },
      { label: "Checking trust", icon: <Star className="h-4 w-4" />, completed: false, active: false },
      { label: "AI matching", icon: <Bot className="h-4 w-4" />, completed: false, active: false },
    ];
    setAgentSteps(steps);

    // Animate through steps
    for (let i = 0; i < 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newSteps = [...steps];
      newSteps[i].completed = true;
      newSteps[i].active = false;
      if (i < 3) {
        newSteps[i + 1].active = true;
      }
      setAgentSteps([...newSteps]);
    }

    setIsSearching(false);
    setShowResults(true);
  };

  const filteredProviders = selectedFilter === "all" 
    ? mockProviders 
    : mockProviders.filter(p => p.category.toLowerCase() === selectedFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20">
        {/* Gradient background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 w-full max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="p-3 rounded-full bg-primary/10"
              >
                <Bot className="h-6 w-6 text-primary" />
              </motion.div>
              <Badge className="gradient-primary border-0" variant="default">
                Powered by AI
              </Badge>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
              Your Personal AI for
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Real-World Services
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tell our Mother AI what you need. We'll find, compare, and book the perfect service provider in seconds.
            </p>
          </motion.div>

          {/* AI Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mb-8"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
              <div className="relative flex items-center gap-3 bg-background/80 backdrop-blur-lg rounded-2xl border border-primary/20 p-4 shadow-2xl hover:border-primary/40 transition-all">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="What service do you need? (e.g., plumber, cleaner, electrician...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                  className="border-0 bg-transparent focus:outline-none text-lg placeholder:text-muted-foreground"
                />
                <Button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="gradient-primary border-0 rounded-lg flex-shrink-0"
                >
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </motion.form>

          {/* AI Agent Status */}
          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-card/80 backdrop-blur-lg rounded-2xl border border-border p-6 mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                    <Bot className="h-5 w-5 text-primary" />
                  </motion.div>
                  <p className="font-semibold">Mother AI is creating agents...</p>
                </div>

                <div className="space-y-3">
                  {agentSteps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`p-2 rounded-lg transition-all ${
                        step.completed
                          ? "bg-green-100/30 text-green-600"
                          : step.active
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : step.active ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                            {step.icon}
                          </motion.div>
                        ) : (
                          step.icon
                        )}
                      </div>
                      <span className={step.completed || step.active ? "font-medium" : "text-muted-foreground"}>
                        {step.label}
                      </span>
                      {step.completed && <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence>
        {showResults && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="py-16 px-4"
          >
            <div className="max-w-6xl mx-auto">
              {/* Results Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  AI-Matched Services for <span className="text-primary">"{searchQuery}"</span>
                </h2>
                <p className="text-muted-foreground">
                  {filteredProviders.length} providers found, ranked by AI match score
                </p>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap gap-2 mb-8">
                <Button
                  variant={selectedFilter === "all" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("all")}
                  className="gradient-primary border-0"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  All
                </Button>
                {["Plumbing", "Electrical", "Cleaning", "AC Repair"].map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedFilter === cat.toLowerCase() ? "default" : "outline"}
                    onClick={() => setSelectedFilter(cat.toLowerCase())}
                    className={selectedFilter === cat.toLowerCase() ? "gradient-primary border-0" : ""}
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredProviders.map((provider, idx) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-0 shadow-card hover:shadow-lg transition-all group cursor-pointer h-full">
                      <CardContent className="p-4">
                        {/* AI Match Badge */}
                        {provider.isAIMatch && (
                          <div className="mb-3">
                            <Badge className="gradient-primary border-0 text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Best Match {provider.match}%
                            </Badge>
                          </div>
                        )}

                        {/* Provider Avatar */}
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                          {provider.image}
                        </div>

                        {/* Provider Info */}
                        <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                          {provider.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {provider.category}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="font-semibold text-sm">
                            {provider.rating}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({provider.reviews})
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {provider.distance}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {provider.availability}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <IndianRupee className="h-3 w-3" />
                            {provider.price}
                          </div>
                        </div>

                        {/* Book Button */}
                        <Button
                          onClick={() => {
                            if (!user) {
                              navigate("/login?redirect=/services");
                            } else {
                              navigate(`/service/${provider.id}`);
                            }
                          }}
                          className="w-full gradient-primary border-0 group-hover:shadow-lg transition-all"
                        >
                          Book Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* How AI Works */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-16 bg-card rounded-2xl border border-border p-8"
              >
                <h3 className="text-2xl font-bold mb-8 text-center">How Our Mother AI Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: <Search className="h-8 w-8" />,
                      title: "Understanding Your Need",
                      desc: "AI analyzes your request to understand exactly what service you need",
                    },
                    {
                      icon: <Zap className="h-8 w-8" />,
                      title: "Creating Micro-Agents",
                      desc: "Spawns specialized AI agents to find & compare local providers",
                    },
                    {
                      icon: <CheckCircle className="h-8 w-8" />,
                      title: "Smart Matching",
                      desc: "Ranks providers by price, rating, availability & AI confidence",
                    },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="text-center"
                    >
                      <div className="flex justify-center mb-4 p-3 rounded-full bg-primary/10 w-fit mx-auto">
                        <div className="text-primary">{item.icon}</div>
                      </div>
                      <h4 className="font-semibold mb-2">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
