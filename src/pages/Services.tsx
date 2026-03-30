import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, MapPin, Clock, ArrowLeft, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/assets/logo.png";

interface ServiceWithProvider {
  id: string;
  title: string;
  description: string | null;
  price: number;
  price_type: string;
  experience_years: number | null;
  category_id: string;
  provider_id: string;
  provider_name: string;
  provider_location: string;
  category_name: string;
  avg_rating: number;
  review_count: number;
}

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [aiDetails, setAiDetails] = useState("");
  const [aiLocation, setAiLocation] = useState("");
  const [aiDate, setAiDate] = useState("");
  const [aiTime, setAiTime] = useState("");
  const [aiMatch, setAiMatch] = useState<ServiceWithProvider | null>(null);

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const fetchServices = async () => {
    setLoading(true);
    let query = supabase
      .from("services")
      .select("*, categories(name)")
      .eq("is_active", true);

    if (selectedCategory && selectedCategory !== "all") {
      query = query.eq("category_id", selectedCategory);
    }

    const { data: servicesData } = await query;

    if (!servicesData) { setLoading(false); return; }

    const providerIds = [...new Set(servicesData.map(s => s.provider_id))];
    const [{ data: profiles }, { data: reviews }] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, location").in("user_id", providerIds),
      supabase.from("reviews").select("provider_id, rating").in("provider_id", providerIds),
    ]);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
    const ratingMap = new Map<string, { sum: number; count: number }>();
    (reviews || []).forEach(r => {
      const existing = ratingMap.get(r.provider_id) || { sum: 0, count: 0 };
      ratingMap.set(r.provider_id, { sum: existing.sum + r.rating, count: existing.count + 1 });
    });

    const mapped: ServiceWithProvider[] = servicesData.map(s => {
      const profile = profileMap.get(s.provider_id);
      const rating = ratingMap.get(s.provider_id);
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        price: s.price,
        price_type: s.price_type,
        experience_years: s.experience_years,
        category_id: s.category_id,
        provider_id: s.provider_id,
        provider_name: profile?.full_name || "Provider",
        provider_location: profile?.location || "",
        category_name: (s.categories as any)?.name || "",
        avg_rating: rating ? Math.round((rating.sum / rating.count) * 10) / 10 : 0,
        review_count: rating?.count || 0,
      };
    });

    setServices(mapped);
    setLoading(false);
  };

  const filtered = services.filter(s =>
    !searchQuery.trim() ||
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.provider_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const aiRecommendService = () => {
    const details = aiDetails.trim().toLowerCase();
    const location = aiLocation.trim().toLowerCase();

    if (!details) {
      setAiMatch(null);
      return;
    }

    const detailTokens = details.split(/\s+/).filter(Boolean);

    let best: ServiceWithProvider | null = null;
    let bestScore = -Infinity;

    for (const service of services) {
      let score = 0;
      const searchable = `${service.title} ${service.description || ""} ${service.category_name} ${service.provider_name}`.toLowerCase();

      detailTokens.forEach((token) => {
        if (searchable.includes(token)) score += 2;
      });

      if (location && service.provider_location.toLowerCase().includes(location)) score += 3;
      score += Math.min(service.avg_rating, 5) * 1.5;
      score -= service.price / 1000;
      score += Math.min(service.experience_years || 0, 15) * 0.1;

      if (score > bestScore) {
        bestScore = score;
        best = service;
      }
    }

    setAiMatch(best);
  };

  const getAiBookingLink = () => {
    if (!aiMatch) return "#";
    const params = new URLSearchParams();
    params.set("ai", "1");
    if (aiDetails.trim()) params.set("description", aiDetails.trim());
    if (aiLocation.trim()) params.set("address", aiLocation.trim());
    if (aiDate) params.set("date", aiDate);
    if (aiTime) params.set("time", aiTime);
    return `/service/${aiMatch.id}?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild><Link to="/"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <img src= {Logo} alt="Servixen Logo" />
            </div>
            <span className="font-bold">Servixen</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6 border border-primary/20 bg-primary/5 shadow-card">
          <CardContent className="p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-xl bg-primary/15 p-2 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI Booking Assistant</h2>
                <p className="text-sm text-muted-foreground">
                  Share your requirements and AI will pick the best service match. Then book in one click.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={aiDetails}
                onChange={(e) => setAiDetails(e.target.value)}
                placeholder="What do you need? (e.g., AC repair, urgent, budget-friendly)"
                className="md:col-span-2"
              />
              <Input
                value={aiLocation}
                onChange={(e) => setAiLocation(e.target.value)}
                placeholder="Location / area"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input type="date" value={aiDate} onChange={(e) => setAiDate(e.target.value)} />
                <Input type="time" value={aiTime} onChange={(e) => setAiTime(e.target.value)} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button onClick={aiRecommendService} className="gradient-primary border-0">
                <Wand2 className="mr-2 h-4 w-4" />
                Find Best with AI
              </Button>
              {aiMatch ? (
                <Button asChild variant="secondary">
                  <Link to={getAiBookingLink()}>Book with AI</Link>
                </Button>
              ) : null}
            </div>

            {aiMatch ? (
              <div className="mt-4 rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">AI top match</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{aiMatch.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {aiMatch.provider_name} • {aiMatch.provider_location || "Any location"}
                    </p>
                  </div>
                  <p className="font-bold text-primary">₹{aiMatch.price}{aiMatch.price_type === "hourly" ? "/hr" : ""}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search services..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSearchParams(v === "all" ? {} : { category: v }); }}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="border-0 shadow-card"><CardContent className="h-48 animate-pulse bg-muted p-6" /></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No services found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service, i) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link to={`/service/${service.id}`}>
                  <Card className="group border-0 shadow-card transition-all hover:shadow-elevated hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="mb-3 flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">{service.category_name}</Badge>
                        {service.avg_rating > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                            <span className="font-medium">{service.avg_rating}</span>
                            <span className="text-muted-foreground">({service.review_count})</span>
                          </div>
                        )}
                      </div>
                      <h3 className="mb-1 text-lg font-semibold group-hover:text-primary transition-colors">{service.title}</h3>
                      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{service.provider_location || "Any location"}</span>
                        </div>
                        <span className="font-bold text-primary">
                          ₹{service.price}{service.price_type === "hourly" ? "/hr" : ""}
                        </span>
                      </div>
                      {service.experience_years ? (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{service.experience_years} years experience</span>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
