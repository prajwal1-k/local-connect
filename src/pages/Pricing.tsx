import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Star, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    interval: 'monthly',
    description: 'Start with basic listing and up to 5 matches per month.',
    features: ['Basic profile listing', '5 leads per month', 'Standard search placement'],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 499,
    interval: 'monthly',
    description: 'Grow your business with priority lead delivery and better placement.',
    features: ['50 leads per month', 'Verified badge', 'Featured listing', 'Priority support'],
  },
  {
    key: 'premium',
    name: 'Premium',
    price: 999,
    interval: 'monthly',
    description: 'Best for established providers who want maximum visibility.',
    features: ['Unlimited leads', 'Premium search placement', 'Dedicated account support', 'Custom promotions'],
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [loading, setLoading] = useState(false);

  const subscribe = async (plan: typeof PLANS[number]) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (plan.key === 'free') {
      toast({ title: 'Free plan selected', description: 'Your provider profile will remain on the free tier.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: user.id,
          plan_name: plan.name,
          billing_interval: plan.interval,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || 'Unable to start subscription');
      }
      const payload = await response.json();
      if (payload.razorpay_short_url) {
        window.open(payload.razorpay_short_url, '_blank');
      }
      toast({ title: 'Subscription started', description: 'Continue through Razorpay to complete your plan upgrade.' });
    } catch (err:any) {
      toast({ title: 'Subscription failed', description: err.message || 'Could not create subscription', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

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
            <Button variant="outline" onClick={() => navigate('/provider-dashboard/subscription')}>Subscription</Button>
            <Button variant="outline" onClick={() => navigate('/provider-dashboard/billing')}>Billing</Button>
            <Button variant="outline" onClick={() => navigate('/provider-dashboard/usage')}>Usage</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Pricing</p>
              <h1 className="mt-2 text-3xl font-bold">Choose your provider plan</h1>
              <p className="max-w-2xl text-muted-foreground">Pick the right plan for your service listing, lead volume, and marketplace visibility.</p>
            </div>
            <Button className="gradient-primary border-0" onClick={() => subscribe(PLANS.find((plan) => plan.key === selectedPlan)!)} disabled={loading}>
              {loading ? 'Processing...' : 'Continue to checkout'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <Card key={plan.key} className={`border-0 shadow-card ${plan.key === selectedPlan ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="space-y-3 p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <Badge>{plan.interval}</Badge>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant={plan.key === selectedPlan ? 'secondary' : 'outline'}
                    className="w-full"
                    onClick={() => setSelectedPlan(plan.key)}
                  >
                    {plan.key === selectedPlan ? 'Selected' : 'Select'}
                  </Button>
                  <Button className="w-full" onClick={() => subscribe(plan)} disabled={loading && plan.key === selectedPlan}>
                    {plan.key === 'free' ? 'Choose Free' : 'Upgrade'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Why upgrade?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
              <p>Upgrade your plan to unlock more leads, better placement, and greater trust from customers.</p>
              <p>Premium providers appear higher in search and get priority assignment for new service requests.</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Trusted provider features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
              <p><ShieldCheck className="mr-2 inline h-4 w-4" />Verified badge for your profile</p>
              <p><Trophy className="mr-2 inline h-4 w-4" />Featured listing in search</p>
              <p><Star className="mr-2 inline h-4 w-4" />Access to premium analytics and reports</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
