import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, QrCode, Eye, Settings } from "lucide-react";
import { Profile } from "@shared/api";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadProfiles();
  }, [user]);

  const loadProfiles = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error loading profiles:", error);
      toast.error("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profileId: string) => {
    if (!window.confirm("Are you sure you want to delete this profile?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profileId)
        .eq("user_id", user?.id);

      if (error) throw error;
      setProfiles(profiles.filter((p) => p.id !== profileId));
      toast.success("Profile deleted");
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast.error("Failed to delete profile");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                My Profiles
              </h1>
              <p className="text-muted-foreground">
                Create and manage your contact profiles
              </p>
            </div>
            <Link to="/profile/new">
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Profile</span>
                <span className="sm:hidden">New</span>
              </Button>
            </Link>
          </div>

          {/* Profiles Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <p className="mt-4 text-muted-foreground">Loading profiles...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="bg-white rounded-xl border border-border p-12 text-center">
              <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No profiles yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Create your first contact profile to get started
              </p>
              <Link to="/profile/new">
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Create Your First Profile
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 border-b border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {profile.name}
                        </h3>
                        {profile.is_active && (
                          <Badge className="mt-2 bg-primary text-white">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span>{profile.scan_count} scans</span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Created{" "}
                      {new Date(profile.created_at).toLocaleDateString()}
                    </div>

                    {/* Visible Fields Badge */}
                    <div className="flex flex-wrap gap-1">
                      {profile.visibility_settings.phone && (
                        <Badge variant="secondary" className="text-xs">
                          Phone
                        </Badge>
                      )}
                      {profile.visibility_settings.email && (
                        <Badge variant="secondary" className="text-xs">
                          Email
                        </Badge>
                      )}
                      {profile.visibility_settings.messenger_link && (
                        <Badge variant="secondary" className="text-xs">
                          Messenger
                        </Badge>
                      )}
                      {profile.visibility_settings.note && (
                        <Badge variant="secondary" className="text-xs">
                          Note
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-border p-4 flex gap-2">
                    <Link to={`/profile/${profile.id}/edit`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </Link>
                    <Link to={`/view/${profile.id}`} className="flex-1">
                      <Button size="sm" className="w-full gap-2">
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(profile.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
