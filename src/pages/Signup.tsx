import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Eye, EyeOff, User, Briefcase } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import Logo from "@/assets/logo.png";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function Signup() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") === "provider" ? "service_provider" : "service_taker";

  const [role, setRole] = useState<AppRole>(defaultRole as AppRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !fullName.trim()) return;
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password, fullName.trim(), role, { phone, location, bio });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created!", description: "Please check your email to verify your account." });
      navigate("/");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="absolute inset-0 gradient-primary opacity-[0.02]" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-4">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground -ml-2">
            <Link to="/" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Home
            </Link>
          </Button>
        </div>
        <Card className="w-full border-0 shadow-elevated">
          <CardHeader className="text-center">
          <Link to="/" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <img src= {Logo} alt="Servixen Logo" />
          </Link>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join Servixen</CardDescription>
          </CardHeader>
          <CardContent>
          {/* Role selector */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("service_taker")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                role === "service_taker" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
            >
              <User className={`h-6 w-6 ${role === "service_taker" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${role === "service_taker" ? "text-primary" : "text-muted-foreground"}`}>
                I need a service
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRole("service_provider")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                role === "service_provider" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
            >
              <Briefcase className={`h-6 w-6 ${role === "service_provider" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${role === "service_provider" ? "text-primary" : "text-muted-foreground"}`}>
                I provide services
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="City, State" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100} required/>
            </div>
            {role === "service_provider" && (
              <div className="space-y-2">
                <Label htmlFor="bio">About Your Services</Label>
                <Textarea id="bio" placeholder="Describe your experience and services..." value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} />
              </div>
            )}
            <Button type="submit" className="w-full gradient-primary border-0" size="lg" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
          </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
