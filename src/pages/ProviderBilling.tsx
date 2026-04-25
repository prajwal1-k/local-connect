import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CreditCard, Download, RefreshCcw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function ProviderBilling() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBillingHistory();
  }, [user]);

  const fetchBillingHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/billing-history?provider_id=${encodeURIComponent(user.id)}`);
      if (!response.ok) throw new Error('Could not load billing history');
      const data = await response.json();
      setHistory(data || []);
    } catch (err:any) {
      toast({ title: 'Failed', description: err.message || 'Error loading billing history', variant: 'destructive' });
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
            <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate('/'); }}>
              <ArrowRight className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-border bg-card p-6 shadow-card md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Billing</p>
            <h1 className="mt-2 text-3xl font-bold">Payment and invoices</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate('/provider-dashboard/subscription')}>Subscription</Button>
            <Button variant="outline" onClick={() => navigate('/provider-dashboard/usage')}>Usage</Button>
            <Button className="gradient-primary border-0" onClick={() => navigate('/provider-dashboard/upgrade-plan')}>Upgrade Plan</Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 mb-6">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>UPI / Card / Netbanking</span>
              </div>
              <p className="text-sm text-muted-foreground">Update your payment method to keep recurring subscriptions active.</p>
              <Button className="w-full" variant="outline" onClick={() => toast({ title: 'Update payment method', description: 'This action is not implemented in demo mode.' })}>
                Update Payment Method
              </Button>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Billing history</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">View recent invoices and payments for your provider plan.</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Need help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
              <p>Contact support for billing, invoice adjustments and premium plan questions.</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@servixen.com</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Billing history</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-border text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="p-4" colSpan={6}>Loading...</td></tr>
                ) : history.length === 0 ? (
                  <tr><td className="p-4 text-muted-foreground" colSpan={6}>No billing records yet.</td></tr>
                ) : history.map((item) => (
                  <tr key={item._id} className="border-t border-border">
                    <td className="px-4 py-3">{new Date(item.paid_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{item.plan_name}</td>
                    <td className="px-4 py-3">₹{item.amount}</td>
                    <td className="px-4 py-3"><Badge>{item.status}</Badge></td>
                    <td className="px-4 py-3">{item.invoice_url ? <a className="text-primary underline" href={item.invoice_url} target="_blank" rel="noreferrer">View</a> : 'N/A'}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => window.open(item.invoice_url || '#', '_blank')}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
