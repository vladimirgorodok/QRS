import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { VisibilitySettings } from "@shared/api";

interface ProfileFormProps {
  initialName?: string;
  initialPhone?: string;
  initialEmail?: string;
  initialMessenger?: string;
  initialNote?: string;
  initialVisibility?: VisibilitySettings;
  onSubmit: (data: {
    name: string;
    phone: string;
    email: string;
    messenger_link: string;
    note: string;
    visibility_settings: VisibilitySettings;
  }) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

const DEFAULT_VISIBILITY: VisibilitySettings = {
  phone: true,
  email: true,
  messenger_link: true,
  note: true,
  avatar: true,
};

export const ProfileForm = ({
  initialName = "",
  initialPhone = "",
  initialEmail = "",
  initialMessenger = "",
  initialNote = "",
  initialVisibility = DEFAULT_VISIBILITY,
  onSubmit,
  isLoading = false,
  submitLabel = "Save Profile",
}: ProfileFormProps) => {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);
  const [messenger, setMessenger] = useState(initialMessenger);
  const [note, setNote] = useState(initialNote);
  const [visibility, setVisibility] = useState<VisibilitySettings>(
    initialVisibility
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        name,
        phone,
        email,
        messenger_link: messenger,
        note,
        visibility_settings: visibility,
      });
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Contact Information
        </h2>

        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="messenger">Telegram/WhatsApp/Messenger Link</Label>
          <Input
            id="messenger"
            value={messenger}
            onChange={(e) => setMessenger(e.target.value)}
            placeholder="https://t.me/username or wa.me/1234567890"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="note">Note or Additional Info</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any additional information you want to share..."
            rows={4}
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Visibility Settings */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-lg font-semibold text-foreground">
          What should be visible when people scan your QR code?
        </h2>
        <p className="text-sm text-muted-foreground">
          Toggle each field to control what information is shared with others
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-border">
            <div>
              <Label className="font-medium text-foreground">Phone Number</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Allow calling or SMS
              </p>
            </div>
            <Switch
              checked={visibility.phone}
              onCheckedChange={(checked) =>
                setVisibility({ ...visibility, phone: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-border">
            <div>
              <Label className="font-medium text-foreground">Email</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Allow sending emails
              </p>
            </div>
            <Switch
              checked={visibility.email}
              onCheckedChange={(checked) =>
                setVisibility({ ...visibility, email: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-border">
            <div>
              <Label className="font-medium text-foreground">
                Messenger Link
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Telegram, WhatsApp, or Messenger
              </p>
            </div>
            <Switch
              checked={visibility.messenger_link}
              onCheckedChange={(checked) =>
                setVisibility({ ...visibility, messenger_link: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-border">
            <div>
              <Label className="font-medium text-foreground">Note</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Additional information
              </p>
            </div>
            <Switch
              checked={visibility.note}
              onCheckedChange={(checked) =>
                setVisibility({ ...visibility, note: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        disabled={isLoading || !name.trim()}
        className="w-full"
      >
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
};
