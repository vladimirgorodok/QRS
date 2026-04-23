import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, QrCode } from "lucide-react";

export const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) return null;

  return (
    <header className="border-b border-border bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors"
        >
          <QrCode className="w-6 h-6" />
          <span className="hidden sm:inline">ContactShare</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
