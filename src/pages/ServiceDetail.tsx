import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function ServiceDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [service, setService] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDesc, setBookingDesc] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  useEffect(() => {
    const aiMode = searchParams.get("ai") === "1";
    if (!aiMode) return;

    setBookingDesc(searchParams.get("description") || "");
    setBookingAddress(searchParams.get("address") || "");
    setBookingDate(searchParams.get("date") || "");
    setBookingTime(searchParams.get("time") || "");
    setBookingOpen(true);
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const svcResponse = await fetch(`/api/services/${id}`);
      if (!svcResponse.ok) {
        throw new Error("Service not found");
      }

      const svc = await svcResponse.json();
      if (!svc) {
        setLoading(false);
        return;
      }

      setService({ ...svc, id: svc._id });

      const [{ data: prof }, { data: revs }, { data: categoryData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", svc.provider_id).single(),
        supabase.from("reviews").select("*, profiles!reviews_reviewer_id_fkey(full_name)").eq("provider_id", svc.provider_id),
        supabase.from("categories").select("*").eq("id", svc.category_id).single(),
      ]);

      setProvider(prof);
      setReviews(revs || []);
      if (categoryData) {
        setService((prev) => ({ ...prev, category: categoryData }));
      }
    } catch (err:any) {
      console.error(err);
      toast({ title: "Error loading service", description: err.message || "Service load failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user || !service) return;
    if (!bookingDesc.trim() || !bookingAddress.trim()) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taker_id: user.id,
          provider_id: service.provider_id,
          service_id: service.id,
          description: bookingDesc.trim(),
          address: bookingAddress.trim(),
          preferred_date: bookingDate || null,
          preferred_time: bookingTime || null,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let message = 'Failed to create service request';
        try {
          const body = JSON.parse(text);
          message = body?.message || body?.error || text || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }

      toast({ title: "Request sent!", description: "The provider will respond to your request shortly." });
      setBookingOpen(false);
      setBookingDesc("");
      setBookingAddress("");
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message || "Error creating service request", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!user || !service) return;
    setSubmittingReview(true);

    try {
      const response = await fetch(
        `/api/service-requests?service_id=${encodeURIComponent(service.id)}&taker_id=${encodeURIComponent(user.id)}&status=completed`
      );

      if (!response.ok) {
        const text = await response.text();
        let message = "Failed to verify completed booking";
        try {
          const body = JSON.parse(text);
          message = body?.message || body?.error || text || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }

      const completedRequests = await response.json();
      if (!Array.isArray(completedRequests) || completedRequests.length === 0) {
        toast({
          title: "Review not allowed yet",
          description: "A completed booking is required before leaving a review.",
          variant: "destructive",
        });
        setSubmittingReview(false);
        return;
      }

      const requestId = completedRequests[0].id;
      
      if (!requestId) {
        throw new Error("Invalid request ID - cannot submit review without a valid booking ID");
      }

      const { data: existingReview, error: reviewSearchError } = await supabase
        .from("reviews")
        .select("id")
        .eq("request_id", requestId)
        .eq("reviewer_id", user.id)
        .maybeSingle();

      if (reviewSearchError) {
        throw new Error(reviewSearchError.message);
      }

      if (existingReview) {
        toast({ title: "You already reviewed this service.", variant: "destructive" });
        setSubmittingReview(false);
        return;
      }

      const { error } = await supabase.from("reviews").insert({
        request_id: requestId,
        reviewer_id: user.id,
        provider_id: service.provider_id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({ title: "Review submitted!" });
      setReviewComment("");
      setReviewRating(5);
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to submit review", description: err.message || "Please try again later.", variant: "destructive" });
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!service) return <div className="flex min-h-screen items-center justify-center"><p>Service not found</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <span className="font-bold">Service Details</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Card className="mb-6 border-0 shadow-elevated">
          <CardContent className="p-8">
            <Badge variant="secondary" className="mb-3">{(service.category as any)?.name || "Uncategorized"}</Badge>
            <h1 className="mb-2 text-3xl font-bold">{service.title}</h1>
            <p className="mb-6 text-muted-foreground">{service.description}</p>

            <div className="mb-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">₹{service.price}</span>
                <span className="text-sm text-muted-foreground">/ {service.price_type}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {service.location?.trim() ? service.location : "Location not specified"}
              </div>
              {service.experience_years ? (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> {service.experience_years} years exp.
                </div>
              ) : null}
              {avgRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium">{avgRating}</span>
                  <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                </div>
              )}
            </div>

            {provider && (
              <div className="mb-6 rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-primary-foreground font-bold text-lg">
                    {provider.full_name?.[0]?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <p className="font-semibold">{provider.full_name}</p>
                    {provider.location && (
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {provider.location}
                      </p>
                    )}
                  </div>
                </div>
                {provider.bio && <p className="mt-3 text-sm text-muted-foreground">{provider.bio}</p>}
              </div>
            )}

            {user && role === "service_taker" ? (
              <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full gradient-primary border-0">
                    <Send className="mr-2 h-4 w-4" /> Request This Service
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book: {service.title}</DialogTitle>
                  </DialogHeader>
                  {searchParams.get("ai") === "1" ? (
                    <div className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
                      Pre-filled by AI assistant. Review details and send your request.
                    </div>
                  ) : null}
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Describe your requirement *</Label>
                      <Textarea placeholder="What do you need help with?" value={bookingDesc} onChange={(e) => setBookingDesc(e.target.value)} maxLength={500} />
                    </div>
                    <div className="space-y-2">
                      <Label>Your address *</Label>
                      <Input placeholder="Full address" value={bookingAddress} onChange={(e) => setBookingAddress(e.target.value)} maxLength={200} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Preferred date</Label>
                        <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Preferred time</Label>
                        <Input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
                      </div>
                    </div>
                    <Button className="w-full gradient-primary border-0" onClick={handleBooking} disabled={submitting}>
                      {submitting ? "Sending..." : "Send Request"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : !user ? (
              <Button size="lg" className="w-full" asChild>
                <Link to="/login">Log in to Book</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        {/* Write a Review */}
        {user && role === "service_taker" && (
          <Card className="mb-6 border-0 shadow-card">
            <CardHeader><CardTitle>Write a Review</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setReviewRating(s)} className="transition-transform hover:scale-110">
                    <Star className={`h-7 w-7 ${s <= reviewRating ? "fill-accent text-accent" : "text-muted"}`} />
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Your review</Label>
                <Textarea placeholder="Share your experience..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} maxLength={500} />
              </div>
              <Button className="gradient-primary border-0" onClick={handleReviewSubmit} disabled={submittingReview}>
                {submittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Reviews list */}
        {/* <Card className="border-0 shadow-card">
          <CardHeader><CardTitle>Reviews ({reviews.length})</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="border-b border-border pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`h-4 w-4 ${s <= r.rating ? "fill-accent text-accent" : "text-muted"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{(r as any).profiles?.full_name || "Customer"}</span>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
