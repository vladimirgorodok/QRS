/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Profile visibility settings
export interface VisibilitySettings {
  phone: boolean;
  email: boolean;
  messenger_link: boolean;
  note: boolean;
  avatar: boolean;
}

// Profile database type
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  messenger_link: string;
  note: string;
  avatar_url: string | null;
  visibility_settings: VisibilitySettings;
  is_active: boolean;
  scan_count: number;
  created_at: string;
  updated_at: string;
}

// Public profile view (with visibility filtering applied)
export interface PublicProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  phone?: string;
  email?: string;
  messenger_link?: string;
  note?: string;
}
