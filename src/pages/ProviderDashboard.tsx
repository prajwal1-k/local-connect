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
  const [newLocation, setNewLocation] = useState("");
  const [addingService, setAddingService] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);

    const [{ data: cats }, { data: revs }] = await Promise.all([
      supabase.from("categories").select("*"),
      supabase.from("reviews").select("*, profiles!reviews_reviewer_id_fkey(full_name)").eq("provider_id", user.id).order("created_at", { ascending: false }),
    ]);

    setCategories(cats || []);
    setReviews(revs || []);

    let svcs = [];
    try {
      const response = await fetch(`/api/services?provider_id=${encodeURIComponent(user.id)}`);
      if (!response.ok) {
        throw new Error(`Service fetch failed: ${response.statusText}`);
      }
      svcs = await response.json();
    } catch (err:any) {
      toast({ title: "Failed", description: err.message || "Error loading services", variant: "destructive" });
      svcs = [];
    }

    const categoryMap = new Map((cats || []).map((c: any) => [c.id, c]));
    const serviceWithCategory = (svcs || []).map((svc: any) => ({ 
      ...svc, 
      id: svc._id, 
      location: (svc.location || svc.service_location || '').trim(),
      categories: categoryMap.get(svc.category_id) || null 
    }));
    setMyServices(serviceWithCategory);

    try {
      const requestsResponse = await fetch(`/api/service-requests?provider_id=${encodeURIComponent(user.id)}`);
      if (!requestsResponse.ok) {
        throw new Error(`Requests fetch failed: ${requestsResponse.statusText}`);
      }
      const reqs = await requestsResponse.json();
      if (reqs && reqs.length > 0) {
        const takerIds = [...new Set(reqs.map((r: any) => r.taker_id).filter(Boolean))] as string[];
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, location, phone").in("user_id", takerIds);
        const pMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
        setRequests(reqs.map((r: any) => ({
          ...r,
          id: r.id || r.uuid || r._id,
          uuid: r.uuid || r.id || r._id,
          services: serviceWithCategory.find((svc) => svc.id === r.service_id) || null,
          taker_profile: pMap.get(r.taker_id) || null,
        })));
      } else {
        setRequests([]);
      }
    } catch (err:any) {
      toast({ title: "Failed", description: err.message || "Error loading requests", variant: "destructive" });
      setRequests([]);
    }

    setLoading(false);
  };

  const addService = async () => {
    if (!user || !newTitle.trim() || !newCategory || !newPrice) return;
    setAddingService(true);

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: user.id,
          category_id: newCategory,
          title: newTitle.trim(),
          description: newDesc.trim(),
          price: Number(newPrice) || 0,
          price_type: newPriceType,
          experience_years: Number(newExperience) || 0,
          location: newLocation.trim(),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let message = 'Failed to add service';
        try {
          const body = JSON.parse(text);
          message = body?.message || body?.error || text || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }

      toast({ title: 'Service added!' });
      setShowAddService(false);
      setNewTitle(''); setNewDesc(''); setNewPrice(''); setNewExperience(''); setNewLocation('');
      await fetchAll();
    } catch (err:any) {
      toast({ title: 'Failed', description: err.message || 'Error adding service', variant: 'destructive' });
    } finally {
      setAddingService(false);
    }
  };

  const updateRequestStatus = async (id: string, status: "pending" | "accepted" | "rejected" | "completed" | "cancelled") => {
    try {
      const response = await fetch(`/api/service-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const text = await response.text();
        let message = "Failed to update request";
        try {
          const body = JSON.parse(text);
          message = body?.message || body?.error || text || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }

      toast({ title: `Request ${status}` });
      fetchAll();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Could not update request", variant: "destructive" });
    }
  };

  const deleteService = async (id: string) => {
    try {
      const response = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const text = await response.text();
        let message = 'Failed to delete service';
        try {
          const body = JSON.parse(text);
          message = body?.message || body?.error || text || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }

      toast({ title: 'Service removed' });
      fetchAll();
    } catch (err:any) {
      toast({ title: 'Failed', description: err.message || 'Error deleting service', variant: 'destructive' });
    }
  };

  const markCashCollected = async (id: string) => {
    try {
      const response = await fetch(`/api/service-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_cash_collected: true }),
      });
      if (!response.ok) throw new Error("Failed to mark cash collected");
      toast({ title: "COD marked as collected" });
      fetchAll();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Could not mark cash collection", variant: "destructive" });
    }
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
            <span className="font-bold">Servixen</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Stats row */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Services", value: myServices.length },
            { label: "Pending", value: pendingReqs.length },
            { label: "Completed", value: pastReqs.filter(r => r.status === "completed").length }
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Provider tools</p>
              <h2 className="mt-2 text-2xl font-bold">Subscription & billing</h2>
              <p className="text-sm text-muted-foreground">Quickly manage your plan, billing history, and usage from one place.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate('/provider-dashboard/subscription')}>Subscription</Button>
              <Button variant="outline" onClick={() => navigate('/provider-dashboard/billing')}>Billing</Button>
              <Button variant="outline" onClick={() => navigate('/provider-dashboard/usage')}>Usage</Button>
              <Button className="gradient-primary border-0" onClick={() => navigate('/provider-dashboard/upgrade-plan')}>Upgrade Plan</Button>
            </div>
          </div>
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
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => updateRequestStatus(req.id, "completed")}>
                              <CheckCircle className="mr-1 h-3 w-3" /> Mark Completed
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>


          {/* This is for the add the service file */}
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
                    <div className="space-y-2">
                      <Label>Service Location</Label>
                      <Input placeholder="e.g. Bangalore, Karnataka" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} maxLength={100} />
                    </div>
                    <Button className="w-full gradient-primary border-0" onClick={addService} disabled={addingService}>
                      {addingService ? "Adding..." : "Add Service"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* This will check the length of the services and if there are no services it will show a message to add the first service. 
            If there are services it will show the list of services. */}
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
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.location?.trim() ? s.location : "Location not specified"}</p>
                      <p className="mt-2 font-bold text-primary">₹{s.price} / {s.price_type}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* <Card className="mb-6 border-0 shadow-card">
            <CardHeader>
              <CardTitle>Share Your Services</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col mb-6 border-0 shadow-card">
                {/* QR Code */}
    {/* <div className="p-3 bg-white rounded-lg border">
      <QRCodeCanvas value={shareUrl} size={140} />
    </div> */}

    {/* Link Section */}
    {/* <div className="flex-1 space-y-2">
      <p className="text-sm text-muted-foreground">
        Share this link or QR code with customers so they can book your services.
      </p>

      <div className="flex gap-2">
        <Input value={shareUrl} readOnly />
        <Button variant="outline" onClick={copyLink}>
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
      </div>
    </div>

  </CardContent>
</Card> */}




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
