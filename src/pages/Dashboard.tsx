import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Clock, CheckCircle, XCircle, LogOut, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import Logo from "@/assets/logo.png";


const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("service_requests")
      .select("*, services(title, price, price_type), profiles!service_requests_provider_id_fkey(full_name, location)")
      .eq("taker_id", user.id)
      .order("created_at", { ascending: false });

    // Fix: profiles join may not work with fkey name, let's fetch separately
    if (data) {
      const providerIds = [...new Set(data.map(r => r.provider_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, location").in("user_id", providerIds);
      const pMap = new Map((profiles || []).map(p => [p.user_id, p]));
      setRequests(data.map(r => ({ ...r, provider_profile: pMap.get(r.provider_id) })));
    }
    setLoading(false);
  };

  const submitReview = async (request: any) => {
    if (!user) return;
    const { error } = await supabase.from("reviews").insert({
      request_id: request.id,
      reviewer_id: user.id,
      provider_id: request.provider_id,
      rating,
      comment: comment.trim(),
    });
    if (error) {
      toast({ title: "Failed to submit review", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!" });
      setReviewingId(null);
      setComment("");
      setRating(5);
    }
  };

  const cancelRequest = async (id: string) => {
    await supabase.from("service_requests").update({ status: "cancelled" }).eq("id", id);
    toast({ title: "Request cancelled" });
    fetchRequests();
  };

  const activeRequests = requests.filter(r => ["pending", "accepted"].includes(r.status));
  const pastRequests = requests.filter(r => ["completed", "rejected", "cancelled"].includes(r.status));

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <img src= {Logo} alt="Servixen Logo" />
            </div>
            <span className="font-bold">Servixen</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild><Link to="/services">Browse</Link></Button>
            <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-4">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Home
            </Link>
          </Button>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || "User"} 👋</h1>
          <p className="text-muted-foreground">Manage your service requests</p>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active ({activeRequests.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {loading ? <p className="text-muted-foreground">Loading...</p> : activeRequests.length === 0 ? (
              <Card className="border-0 shadow-card">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No active requests</p>
                  <Button asChild><Link to="/services">Browse Services</Link></Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeRequests.map((req, i) => (
                  <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-0 shadow-card">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{(req.services as any)?.title}</h3>
                            <p className="text-sm text-muted-foreground">{req.provider_profile?.full_name}</p>
                          </div>
                          <Badge className={statusColors[req.status]}>{req.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{req.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          {req.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.address}</span>}
                          {req.preferred_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{req.preferred_date}</span>}
                        </div>
                        {req.status === "pending" && (
                          <Button variant="destructive" size="sm" onClick={() => cancelRequest(req.id)}>Cancel</Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No past requests</p>
            ) : (
              <div className="space-y-4">
                {pastRequests.map((req) => (
                  <Card key={req.id} className="border-0 shadow-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{(req.services as any)?.title}</h3>
                          <p className="text-sm text-muted-foreground">{req.provider_profile?.full_name}</p>
                        </div>
                        <Badge className={statusColors[req.status]}>{req.status}</Badge>
                      </div>
                      {req.status === "completed" && (
                        <Dialog open={reviewingId === req.id} onOpenChange={(o) => setReviewingId(o ? req.id : null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="mt-2"><Star className="mr-1 h-3 w-3" /> Leave Review</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Rate this service</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <button key={s} onClick={() => setRating(s)}>
                                    <Star className={`h-8 w-8 ${s <= rating ? "fill-accent text-accent" : "text-muted"}`} />
                                  </button>
                                ))}
                              </div>
                              <div className="space-y-2">
                                <Label>Comment (optional)</Label>
                                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} />
                              </div>
                              <Button className="w-full gradient-primary border-0" onClick={() => submitReview(req)}>Submit Review</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
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
