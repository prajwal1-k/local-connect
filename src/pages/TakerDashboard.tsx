import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
        const { data } = await supabase.from("service_requests")
        .select("*, services(*, categories(name)), providers(full_name, location), reviews(rating)")
        .eq("taker_id", user?.id);

        setRequests(data || []);
        setloading(false);
    }

    const cancelRequest = async (id: string) => {
        await supabase.from("service_requests").update({ status: "cancelled" }).eq("id", id);
        fetchRequests();
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