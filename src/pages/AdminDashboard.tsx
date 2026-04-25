import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [payments, setPayments] = useState<any[]>([]);
  const [escrowRows, setEscrowRows] = useState<any[]>([]);

  const fetchAll = async () => {
    try {
      const [p, e] = await Promise.all([
        fetch("/api/admin/payments"),
        fetch("/api/admin/escrow"),
      ]);

      if (p.ok) setPayments(await p.json());
      if (e.ok) setEscrowRows(await e.json());
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Could not load admin payments", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const releaseEscrow = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/escrow/${id}/release`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to release escrow");
      toast({ title: "Escrow released" });
      fetchAll();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Release failed", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Payments Control</h1>
      <Tabs defaultValue="payments">
        <TabsList className="mb-6">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="escrow">Escrow</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card className="border-0 shadow-card">
            <CardHeader><CardTitle>All Payments</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {payments.map((row) => (
                <div key={row.id} className="rounded-md border border-border p-3 text-sm">
                  <p>Booking: {row.id}</p>
                  <p>Method: {row.payment_method}</p>
                  <p>Total: ₹{row.total_amount || 0}</p>
                  <p>Invoice: {row.invoice_number}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escrow">
          <Card className="border-0 shadow-card">
            <CardHeader><CardTitle>Escrow Bookings</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {escrowRows.map((row) => (
                <div key={row.id} className="rounded-md border border-border p-3 text-sm">
                  <p>Booking ID: {row.id}</p>
                  <p>User Paid: ₹{row.total_amount || 0}</p>
                  <p>Provider Share: ₹{row.provider_payout_amount || 0}</p>
                  <p>Status: {row.escrow_status}</p>
                  {row.escrow_status === "held" && (
                    <Button size="sm" className="mt-2 gradient-primary border-0" onClick={() => releaseEscrow(row.id)}>
                      Release Manually
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
