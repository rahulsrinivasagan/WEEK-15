export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "member";
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  max_capacity: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Rsvp = {
  id: string;
  event_id: string;
  user_id: string;
  status: "attending" | "not_attending";
  created_at: string;
};

export type RsvpWithProfile = Rsvp & {
  profiles: Profile;
};