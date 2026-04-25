import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, TrendingUp, Eye, ShoppingCart } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function ProviderUsage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSummary();
  }, [user]);

  const fetchSummary = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${encodeURIComponent(user.id)}`);
      if (!response.ok) throw new Error('Could not load usage data');
      const payload = await response.json();
      setSummary(payload.summary);
    } catch (err:any) {
      toast({ title: 'Failed', description: err.message || 'Error loading usage', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const chartData = summary ? [
    { name: 'Leads', value: summary.leads_used },
    { name: 'Bookings', value: summary.bookings_this_month },
    { name: 'Impressions', value: summary.search_impressions },
    { name: 'Clicks', value: summary.profile_views },
  ] : [];

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
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Usage</p>
            <h1 className="mt-2 text-3xl font-bold">Provider analytics</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate('/provider-dashboard/subscription')}>Subscription</Button>
            <Button variant="outline" onClick={() => navigate('/provider-dashboard/billing')}>Billing</Button>
            <Button className="gradient-primary border-0" onClick={() => navigate('/provider-dashboard/upgrade-plan')}>Upgrade Plan</Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4 mb-6">
          <Card className="border-0 shadow-card">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <p className="text-sm">Leads Used This Month</p>
              </div>
              <p className="text-3xl font-semibold">{summary?.leads_used ?? '--'}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-card">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                <p className="text-sm">Bookings Received</p>
              </div>
              <p className="text-3xl font-semibold">{summary?.bookings_this_month ?? '--'}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-card">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <p className="text-sm">Search Impressions</p>
              </div>
              <p className="text-3xl font-semibold">{summary?.search_impressions ?? '--'}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-card">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <p className="text-sm">Conversion Rate</p>
              </div>
              <p className="text-3xl font-semibold">{summary?.conversion_rate ?? '--'}%</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Performance chart</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-72">
              {loading ? (
                <div className="h-72 animate-pulse rounded-3xl bg-muted" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                    <YAxis tick={{ fill: '#6b7280' }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#14b8a6" fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
