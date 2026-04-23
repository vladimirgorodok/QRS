import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/header";
import { ProfileForm } from "@/components/profile-form";
import { QRGenerator } from "@/components/qr-generator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Profile, VisibilitySettings } from "@shared/api";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function ProfileEdit() {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!!profileId);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    loadProfile();
  }, [profileId, user]);

  const loadProfile = async () => {
    if (!profileId || !user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (!data) {
        toast.error("Profile not found");
        navigate("/dashboard");
        return;
      }
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: {
    name: string;
    phone: string;
    email: string;
    messenger_link: string;
    note: string;
    visibility_settings: VisibilitySettings;
  }) => {
    if (!user) return;

    setIsSaving(true);
    try {
      if (profileId) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profileId)
          .eq("user_id", user.id);

        if (error) throw error;
        toast.success("Profile updated successfully!");
        setProfile({
          ...profile!,
          ...data,
          updated_at: new Date().toISOString(),
        });
      } else {
        // Create new profile
        const newId = uuidv4();
        const { error } = await supabase.from("profiles").insert([
          {
            id: newId,
            user_id: user.id,
            ...data,
            is_active: true,
            scan_count: 0,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
        toast.success("Profile created successfully!");
        navigate(`/profile/${newId}/edit`);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin mb-4">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full" />
            </div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {profileId ? "Edit Profile" : "Create New Profile"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {profileId
                ? "Update your contact information and visibility settings"
                : "Set up your contact profile and choose what information to share"}
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Form Section */}
            <div className="bg-white rounded-xl border border-border p-6">
              <ProfileForm
                initialName={profile?.name || ""}
                initialPhone={profile?.phone || ""}
                initialEmail={profile?.email || ""}
                initialMessenger={profile?.messenger_link || ""}
                initialNote={profile?.note || ""}
                initialVisibility={
                  profile?.visibility_settings || {
                    phone: true,
                    email: true,
                    messenger_link: true,
                    note: true,
                    avatar: true,
                  }
                }
                onSubmit={handleFormSubmit}
                isLoading={isSaving}
                submitLabel={profileId ? "Save Changes" : "Create Profile"}
              />
            </div>

            {/* QR Code Section - Only show for existing profiles */}
            {profileId && profile && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Your QR Code
                </h2>
                <QRGenerator
                  profileId={profileId}
                  profileName={profile.name}
                />
              </div>
            )}

            {/* Empty state for new profiles */}
            {!profileId && (
              <div className="bg-white rounded-xl border border-border p-6 flex items-center justify-center min-h-96">
                <div className="text-center">
                  <div className="text-4xl mb-4">📱</div>
                  <p className="text-muted-foreground">
                    Create your profile first to generate a QR code
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
