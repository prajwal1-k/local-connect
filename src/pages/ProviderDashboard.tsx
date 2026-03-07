import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Plus, LogOut, MapPin, Calendar, Check, X, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function ProviderDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [myServices, setMyServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New service form
  const [showAddService, setShowAddService] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newPriceType, setNewPriceType] = useState("fixed");
  const [newCategory, setNewCategory] = useState("");
  const [newExperience, setNewExperience] = useState("");
  const [addingService, setAddingService] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    const [{ data: cats }, { data: svcs }, { data: reqs }, { data: revs }] = await Promise.all([
      supabase.from("categories").select("*"),
      supabase.from("services").select("*, categories(name)").eq("provider_id", user.id),
      supabase.from("service_requests").select("*, services(title)").eq("provider_id", user.id).order("created_at", { ascending: false }),
      supabase.from("reviews").select("*, profiles!reviews_reviewer_id_fkey(full_name)").eq("provider_id", user.id).order("created_at", { ascending: false }),
    ]);

    setCategories(cats || []);
    setMyServices(svcs || []);
    setReviews(revs || []);

    // Fetch taker profiles for requests
    if (reqs) {
      const takerIds = [...new Set(reqs.map(r => r.taker_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, location, phone").in("user_id", takerIds);
      const pMap = new Map((profiles || []).map(p => [p.user_id, p]));
      setRequests(reqs.map(r => ({ ...r, taker_profile: pMap.get(r.taker_id) })));
    }
    setLoading(false);
  };

  const addService = async () => {
    if (!user || !newTitle.trim() || !newCategory || !newPrice) return;
    setAddingService(true);
    const { error } = await supabase.from("services").insert({
      provider_id: user.id,
      category_id: newCategory,
      title: newTitle.trim(),
      description: newDesc.trim(),
      price: parseFloat(newPrice),
      price_type: newPriceType,
      experience_years: newExperience ? parseInt(newExperience) : 0,
    });
    setAddingService(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Service added!" });
      setShowAddService(false);
      setNewTitle(""); setNewDesc(""); setNewPrice(""); setNewExperience("");
      fetchAll();
    }
  };

  const updateRequestStatus = async (id: string, status: "pending" | "accepted" | "rejected" | "completed" | "cancelled") => {
    await supabase.from("service_requests").update({ status }).eq("id", id);
    toast({ title: `Request ${status}` });
    fetchAll();
  };

  const deleteService = async (id: string) => {
    await supabase.from("services").delete().eq("id", id);
    toast({ title: "Service removed" });
    fetchAll();
  };

  const pendingReqs = requests.filter(r => r.status === "pending");
  const activeReqs = requests.filter(r => r.status === "accepted");
  const pastReqs = requests.filter(r => ["completed", "rejected", "cancelled"].includes(r.status));
  const avgRating = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">K</span>
            </div>
            <span className="font-bold">KodeQuantum</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Stats row */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Services", value: myServices.length },
            { label: "Pending", value: pendingReqs.length },
            { label: "Completed", value: pastReqs.filter(r => r.status === "completed").length },
            { label: "Rating", value: avgRating > 0 ? `${avgRating} ⭐` : "N/A" },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="requests">
          <TabsList className="mb-6">
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="services">My Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            {loading ? <p className="text-muted-foreground">Loading...</p> : requests.length === 0 ? (
              <Card className="border-0 shadow-card"><CardContent className="py-12 text-center text-muted-foreground">No requests yet. Add services to start receiving bookings.</CardContent></Card>
            ) : (
              <div className="space-y-4">
                {[...pendingReqs, ...activeReqs, ...pastReqs].map((req, i) => (
                  <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="border-0 shadow-card">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{(req.services as any)?.title}</h3>
                            <p className="text-sm text-muted-foreground">From: {req.taker_profile?.full_name || "Customer"}</p>
                          </div>
                          <Badge className={statusColors[req.status]}>{req.status}</Badge>
                        </div>
                        <p className="text-sm mb-2">{req.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                          {req.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.address}</span>}
                          {req.preferred_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{req.preferred_date}</span>}
                          {req.preferred_time && <span>{req.preferred_time}</span>}
                          {req.taker_profile?.phone && <span>📞 {req.taker_profile.phone}</span>}
                        </div>
                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" className="gradient-primary border-0" onClick={() => updateRequestStatus(req.id, "accepted")}>
                              <Check className="mr-1 h-3 w-3" /> Accept
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => updateRequestStatus(req.id, "rejected")}>
                              <X className="mr-1 h-3 w-3" /> Reject
                            </Button>
                          </div>
                        )}
                        {req.status === "accepted" && (
                          <Button size="sm" variant="outline" onClick={() => updateRequestStatus(req.id, "completed")}>
                            <CheckCircle className="mr-1 h-3 w-3" /> Mark Completed
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="services">
            <div className="mb-4 flex justify-end">
              <Dialog open={showAddService} onOpenChange={setShowAddService}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary border-0"><Plus className="mr-1 h-4 w-4" /> Add Service</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Service</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Service Title *</Label>
                      <Input placeholder="e.g. AC Repair & Service" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={newCategory} onValueChange={setNewCategory}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea placeholder="Describe your service..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} maxLength={500} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Price (₹) *</Label>
                        <Input type="number" placeholder="500" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} min={0} />
                      </div>
                      <div className="space-y-2">
                        <Label>Price Type</Label>
                        <Select value={newPriceType} onValueChange={setNewPriceType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="negotiable">Negotiable</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Years of Experience</Label>
                      <Input type="number" placeholder="3" value={newExperience} onChange={(e) => setNewExperience(e.target.value)} min={0} />
                    </div>
                    <Button className="w-full gradient-primary border-0" onClick={addService} disabled={addingService}>
                      {addingService ? "Adding..." : "Add Service"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {myServices.length === 0 ? (
              <Card className="border-0 shadow-card"><CardContent className="py-12 text-center text-muted-foreground">No services yet. Add your first service to get started!</CardContent></Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {myServices.map(s => (
                  <Card key={s.id} className="border-0 shadow-card">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary">{(s.categories as any)?.name}</Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteService(s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                      <p className="mt-2 font-bold text-primary">₹{s.price} / {s.price_type}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            {reviews.length === 0 ? (
              <Card className="border-0 shadow-card"><CardContent className="py-12 text-center text-muted-foreground">No reviews yet.</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <Card key={r.id} className="border-0 shadow-card">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`h-4 w-4 ${s <= r.rating ? "fill-accent text-accent" : "text-muted"}`} />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{(r as any).profiles?.full_name || "Customer"}</span>
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
