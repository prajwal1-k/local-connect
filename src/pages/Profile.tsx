import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    location: "",
    phone: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        location: profile.location || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Verify user session first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated. Please log in again.");
      }

      const profileData = {
        user_id: user.id,
        full_name: formData.full_name || "",
        location: formData.location || "",
        phone: formData.phone || "",
        bio: formData.bio || "",
        avatar_url: formData.avatar_url || "",
      };

      // First try to update
      let { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          location: profileData.location,
          phone: profileData.phone,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
        })
        .eq("user_id", user.id)
        .select();

      // If update failed because row doesn't exist, try inserting
      if (error && (error.message.includes("violates") || error.code === 'PGRST116')) {
        const { data: insertData, error: insertError } = await supabase
          .from("profiles")
          .insert([profileData])
          .select();

        if (insertError) {
          console.error("Profile insert error:", insertError);
          throw new Error(insertError.message || "Failed to create profile.");
        }
        data = insertData;
      } else if (error) {
        console.error("Profile update error:", error);
        throw new Error(error.message || "Failed to update profile.");
      }

      if (!data || data.length === 0) {
        throw new Error("Profile save failed - no data returned");
      }

      toast({ title: "Profile saved successfully!" });
      refreshProfile(); // Refresh profile in context
    } catch (error: any) {
      console.error("Profile save error details:", error);
      toast({ 
        title: "Failed to save profile", 
        description: error.message || "Check your permissions and try again",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max file size is 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `user-avatars/${fileName}`;

      // First, check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarBucketExists = buckets?.some(b => b.name === "avatars");

      if (!avatarBucketExists) {
        const { error: createError } = await supabase.storage.createBucket("avatars", {
          public: true,
        });
        if (createError && !createError.message.includes("already exists")) {
          throw createError;
        }
      }

      // Upload file
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast({ title: "Avatar uploaded successfully! Click Save to apply." });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      const errorMsg = error.message || "Failed to upload avatar";
      toast({ 
        title: "Upload failed", 
        description: errorMsg,
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    setFormData(prev => ({ ...prev, avatar_url: "" }));
    toast({ title: "Avatar removed (preview only)" });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              {isMobile ? (
                <User className="h-5 w-5 text-primary-foreground" />
              ) : (
                <span className="text-sm font-bold text-primary-foreground">K</span>
              )}
            </div>
            <span className="font-bold">Servixen</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8" />
            Edit Profile
          </h1>
          <p className="text-muted-foreground">Update your personal information</p>
        </div>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  {formData.avatar_url && (
                    <div className="relative">
                      <img
                        src={formData.avatar_url}
                        alt="Avatar"
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeAvatar}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Label htmlFor="avatar" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
                      <Upload className="h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload Photo"}
                    </Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Max 5MB, JPG/PNG format. Upload then click Save.</p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="e.g. Mumbai, India"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Description</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Tell us about yourself (e.g., your expertise, experience, skills)"
                  rows={5}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
              </div>

              <Button type="submit" className="w-full gradient-primary border-0" disabled={loading || uploading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">Saves name, location, phone, and bio to your profile.</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}