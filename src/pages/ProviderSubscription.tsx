import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function ProviderSubscription() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${encodeURIComponent(user.id)}`);
      if (!response.ok) throw new Error('Could not load subscription data');
      const payload = await response.json();
      setSubscription(payload.subscription);
      setSummary(payload.summary);
    } catch (err:any) {
      toast({ title: "Failed", description: err.message || "Error loading subscription", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!user) return;
    setCanceling(true);
    try {
      const response = await fetch(`/api/subscriptions/${encodeURIComponent(user.id)}/cancel`, {
        method: 'PUT',
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to cancel subscription');
      }
      toast({ title: 'Subscription cancelled', description: 'Your provider plan will stop renewing at period end.' });
      fetchSubscription();
    } catch (err:any) {
      toast({ title: 'Failed', description: err.message || 'Could not cancel subscription', variant: 'destructive' });
    } finally {
      setCanceling(false);
    }
  };

  const planName = subscription?.plan_name || 'Free';
  const renewalDate = subscription?.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : 'N/A';
  const leadsUsed = summary?.leads_used ?? 0;
  const leadsLimit = summary?.leads_limit ?? 5;
  const profileViews = summary?.profile_views ?? 0;
  const bookings = summary?.bookings_this_month ?? 0;
  const revenue = summary?.revenue_generated ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/provider-dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">S</span>
            </div>
            <span className="font-bold">Servixen</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate('/'); }}>
              <ArrowRight className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-border bg-card p-6 shadow-card md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Subscription dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Provider Subscription</h1>
            <p className="text-muted-foreground">Manage your plan, leads, billing and visibility.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate('/provider-dashboard/subscription')}>Subscription</Button>
            <Button variant="outline" onClick={() => navigate('/provider-dashboard/billing')}>Billing</Button>
            <Button variant="outline" onClick={() => navigate('/provider-dashboard/usage')}>Usage</Button>
            <Button className="gradient-primary border-0" onClick={() => navigate('/provider-dashboard/upgrade-plan')}>Upgrade Plan</Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-3xl bg-muted" />
            <div className="grid gap-4 lg:grid-cols-3">
              {[1,2,3].map(i => <div key={i} className="h-40 animate-pulse rounded-3xl bg-muted" />)}
            </div>
          </div>
        ) : (
          <>
            {subscription?.status !== 'free' && leadsLimit !== null && leadsUsed >= leadsLimit ? (
              <Card className="mb-6 border-0 shadow-card">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">Lead limit reached</p>
                      <p className="text-sm text-muted-foreground">You've used all monthly leads. Upgrade to Pro for 50 leads + Verified Badge.</p>
                    </div>
                    <Button className="gradient-primary border-0" onClick={() => navigate('/provider-dashboard/upgrade-plan')}>Upgrade Now</Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-4">
              <Card className="border-0 shadow-card">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Plan</p>
                      <h3 className="text-xl font-semibold">{planName}</h3>
                    </div>
                    <Badge>{subscription?.status || 'free'}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Renewal Date</p>
                  <p className="text-lg font-semibold">{renewalDate}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <p className="text-sm">Leads Used</p>
                  </div>
                  <p className="text-3xl font-semibold">{leadsUsed} / {leadsLimit ?? '∞'}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <p className="text-sm">Profile Views</p>
                  </div>
                  <p className="text-3xl font-semibold">{profileViews}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <p className="text-sm">Bookings This Month</p>
                  </div>
                  <p className="text-3xl font-semibold">{bookings}</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">₹{revenue.toLocaleString()}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Revenue generated from accepted bookings this month.</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle>Plan actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-6">
                  <Button className="w-full gradient-primary border-0" onClick={() => navigate('/provider-dashboard/upgrade-plan')}>Upgrade Plan</Button>
                  <Button className="w-full" variant="outline" onClick={() => navigate('/provider-dashboard/billing')}>Manage Billing</Button>
                  <Button className="w-full" variant="destructive" onClick={cancelSubscription} disabled={canceling || subscription?.status === 'free'}>{canceling ? 'Cancelling...' : 'Cancel Subscription'}</Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle>Visibility Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
                  <p>{subscription?.verified_badge ? 'Verified badge active' : 'Verified badge not active'}</p>
                  <p>{subscription?.featured_listing ? 'Featured listing enabled' : 'Featured listing not enabled'}</p>
                  <p>{subscription?.auto_renew ? 'Auto-renew is enabled' : 'Auto-renew is disabled'}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle>Need support?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
                  <p>Providers on higher plans receive priority support and business guidance.</p>
                  <p>Upgrade to access analytics, CRM tools, and premium placement.</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
