import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, MapPin, Clock, ArrowLeft, Sparkles, Wand2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
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
  service_location: string;
  category_name: string;
  avg_rating: number;
  review_count: number;
}

export default function Services() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "");

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, selectedLocation]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("is_active", "true");
      if (selectedCategory && selectedCategory !== "all") {
        queryParams.set("category_id", selectedCategory);
      }
      if (selectedLocation && selectedLocation.trim()) {
        queryParams.set("location", selectedLocation.trim());
      }

      const servicesResponse = await fetch(`/api/services?${queryParams.toString()}`);
      if (!servicesResponse.ok) {
        throw new Error("Could not fetch services from API");
      }

      const servicesData = await servicesResponse.json();
      if (!Array.isArray(servicesData)) {
        throw new Error("Invalid services data");
      }

      const providerIds = [...new Set(servicesData.map((s: any) => s.provider_id))];
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

      const categoryMap = new Map(categories.map(c => [c.id, c.name]));

      const mapped: ServiceWithProvider[] = servicesData.map(s => {
        const profile = profileMap.get(s.provider_id);
        const rating = ratingMap.get(s.provider_id);
        return {
          id: s._id,
          title: s.title,
          description: s.description,
          price: s.price,
          price_type: s.price_type,
          experience_years: s.experience_years,
          category_id: s.category_id,
          provider_id: s.provider_id,
          provider_name: profile?.full_name || "Provider",
          provider_location: (profile?.location || '').trim(),
          service_location: (s.location || s.service_location || '').trim(),
          category_name: categoryMap.get(s.category_id) || "",
          avg_rating: rating ? Math.round((rating.sum / rating.count) * 10) / 10 : 0,
          review_count: rating?.count || 0,
        };
      });

      setServices(mapped);
    } catch (err:any) {
      console.error(err);
      toast({ title: "Failed", description: err.message || "Error loading services", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = services.filter(s =>
    !searchQuery.trim() ||
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.provider_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.service_location.toLowerCase().includes(searchQuery.toLowerCase())
  );


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
        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 md:w-auto">
            <Input
              placeholder="Enter city..."
              className="w-full md:w-40"
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                const params = new URLSearchParams(searchParams);
                if (e.target.value.trim()) {
                  params.set("location", e.target.value.trim());
                } else {
                  params.delete("location");
                }
                setSearchParams(params);
              }}
            />
            <Select value={selectedCategory} onValueChange={(v) => {
              setSelectedCategory(v);
              const params = new URLSearchParams(searchParams);
              if (v === "all") {
                params.delete("category");
              } else {
                params.set("category", v);
              }
              setSearchParams(params);
            }}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
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
                <Card className="group border-0 shadow-card transition-all hover:shadow-elevated hover:-translate-y-1">
                  <CardContent className="p-6">
                    <Link to={`/service/${service.id}`} className="block">
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
                          <span>{service.service_location?.trim() ? service.service_location : (service.provider_location?.trim() ? service.provider_location : "Location not specified")}</span>
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
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
