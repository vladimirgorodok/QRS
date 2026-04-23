import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MessageCircle,
  Copy,
  CheckCircle,
} from "lucide-react";
import { Profile, PublicProfile } from "@shared/api";
import { toast } from "sonner";

export default function ProfileView() {
  const { profileId } = useParams<{ profileId: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) return;
    loadProfile();
    recordScan();
  }, [profileId]);

  const loadProfile = async () => {
    if (!profileId) return;

    try {
      setLoading(true);
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .eq("is_active", true)
        .single();

      if (error) {
        throw error;
      }

      if (!profileData) {
        toast.error("Profile not found");
        setProfile(null);
        return;
      }

      // Filter data based on visibility settings
      const visibility = profileData.visibility_settings;
      const publicProfile: PublicProfile = {
        id: profileData.id,
        name: profileData.name,
        avatar_url: profileData.avatar_url,
      };

      if (visibility.phone && profileData.phone) {
        publicProfile.phone = profileData.phone;
      }
      if (visibility.email && profileData.email) {
        publicProfile.email = profileData.email;
      }
      if (visibility.messenger_link && profileData.messenger_link) {
        publicProfile.messenger_link = profileData.messenger_link;
      }
      if (visibility.note && profileData.note) {
        publicProfile.note = profileData.note;
      }

      setProfile(publicProfile);
      setScanCount(profileData.scan_count);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const recordScan = async () => {
    if (!profileId) return;

    try {
      // Increment scan count
      await supabase.rpc("increment_scan_count", {
        profile_id: profileId,
      });
    } catch (error) {
      console.error("Error recording scan:", error);
      // Silently fail - don't interrupt user experience
    }
  };

  const handleCall = () => {
    if (profile?.phone) {
      window.location.href = `tel:${profile.phone}`;
    }
  };

  const handleEmail = () => {
    if (profile?.email) {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const handleMessenger = () => {
    if (profile?.messenger_link) {
      window.open(profile.messenger_link, "_blank");
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full" />
          </div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Profile Not Found
          </h1>
          <p className="text-muted-foreground">
            This profile doesn't exist or has been deactivated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 h-24" />

          {/* Content */}
          <div className="px-6 pt-4 pb-6 text-center">
            {/* Profile Name */}
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {profile.name}
            </h1>

            {/* Info Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-primary font-medium">
                ✓ This contact is securely shared via QR code
              </p>
            </div>

            {/* Contact Fields */}
            <div className="space-y-3 mb-6">
              {/* Phone */}
              {profile.phone && (
                <div className="flex items-stretch rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={handleCall}
                    className="flex-1 bg-primary text-white font-medium py-3 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="hidden sm:inline">Call</span>
                  </button>
                  <button
                    onClick={() => handleCopy(profile.phone, "phone")}
                    className="px-3 py-3 hover:bg-slate-50 transition-colors border-l border-border"
                  >
                    {copied === "phone" ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <Copy className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              )}

              {/* Email */}
              {profile.email && (
                <div className="flex items-stretch rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={handleEmail}
                    className="flex-1 bg-primary text-white font-medium py-3 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="hidden sm:inline">Email</span>
                  </button>
                  <button
                    onClick={() => handleCopy(profile.email, "email")}
                    className="px-3 py-3 hover:bg-slate-50 transition-colors border-l border-border"
                  >
                    {copied === "email" ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <Copy className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              )}

              {/* Messenger */}
              {profile.messenger_link && (
                <Button
                  onClick={handleMessenger}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <MessageCircle className="w-5 h-5" />
                  Message
                </Button>
              )}
            </div>

            {/* Note */}
            {profile.note && (
              <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-muted-foreground">{profile.note}</p>
              </div>
            )}

            {/* Footer Info */}
            <div className="text-xs text-muted-foreground border-t border-border pt-4">
              <p>Profile shared via ContactShare</p>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Scan count: {scanCount}
        </p>
      </div>
    </div>
  );
}
