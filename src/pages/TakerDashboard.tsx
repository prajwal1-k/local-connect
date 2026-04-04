import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trash2 } from "lucide-react";

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-gray-100 text-gray-800",
};

export default function TakerDashboard(){
    const { user } = useAuth();

    const navigate = useNavigate();

    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setloading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchRequests();
    }, [user]);

    const fetchRequests = async () => {
        try {
            const response = await fetch(`/api/service-requests?taker_id=${encodeURIComponent(user?.id || '')}`);
            if (!response.ok) {
                throw new Error(`Requests fetch failed: ${response.statusText}`);
            }

            const data = await response.json();
            const enrichedRequests = await Promise.all((data || []).map(async (req: any) => {
                try {
                    const serviceResponse = await fetch(`/api/services/${req.service_id}`);
                    const service = serviceResponse.ok ? await serviceResponse.json() : null;

                    const { data: provider } = await supabase
                        .from("profiles")
                        .select("full_name, location")
                        .eq("user_id", req.provider_id)
                        .single();

                    const { data: reviews } = await supabase
                        .from("reviews")
                        .select("rating")
                        .eq("provider_id", req.provider_id);

                    return {
                        ...req,
                        services: service,
                        providers: provider,
                        reviews: reviews || []
                    };
                } catch (err) {
                    console.error('Error enriching request:', err);
                    return req;
                }
            }));

            setRequests(enrichedRequests);
        } catch (err: any) {
            console.error('Error fetching requests:', err);
            toast({ title: "Failed", description: err.message || "Error loading requests", variant: "destructive" });
        } finally {
            setloading(false);
        }
    }

    const cancelRequest = async (id: string) => {
        try {
            const response = await fetch(`/api/service-requests/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "cancelled" }),
            });

            if (!response.ok) {
                const text = await response.text();
                let message = "Failed to cancel request";
                try {
                    const body = JSON.parse(text);
                    message = body?.message || body?.error || text || message;
                } catch {
                    message = text || message;
                }
                throw new Error(message);
            }

            toast({ title: "Request cancelled" });
            fetchRequests();
        } catch (err: any) {
            toast({ title: "Failed", description: err.message || "Could not cancel request", variant: "destructive" });
        }
    }

    const active = requests.filter(r => ["completed", "rejected", "cancelled"].includes(r.status));

    return(
        <div className="container mx-auto max-w-4xl px-4 py-10">

            <h1 className="text-2xl font-bold mb-6">
                My Bookings
            </h1>
        </div>
    );
}