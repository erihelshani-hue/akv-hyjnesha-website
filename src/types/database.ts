export type Role = "admin" | "member";
export type AttendanceStatus = "yes" | "no" | "maybe";
export type EntityType = "rehearsal" | "event";
export type EventType = "performance" | "wedding" | "festival" | "other";
export type RecurrenceDay = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  language_preference: string;
  created_at: string;
}

export interface Rehearsal {
  id: string;
  title: string;
  title_sq: string;
  date: string;
  time: string;
  location: string;
  notes: string | null;
  notes_sq: string | null;
  is_recurring: boolean;
  recurrence_day: RecurrenceDay | null;
  recurrence_time: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  title_sq: string;
  date: string;
  time: string;
  location: string;
  event_type: EventType;
  dress_code: string | null;
  meetup_time: string | null;
  location_url: string | null;
  notes: string | null;
  notes_sq: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  entity_date: string | null;
  status: AttendanceStatus;
  created_at: string;
}

export interface AttendanceWithProfile extends Attendance {
  profiles: Profile;
}

export interface Announcement {
  id: string;
  title: string;
  title_sq: string;
  body: string;
  body_sq: string;
  created_by: string | null;
  created_at: string;
}

export interface AnnouncementRead {
  id: string;
  user_id: string;
  announcement_id: string;
  read_at: string;
}

export interface RehearsalOccurrence {
  rehearsal: Rehearsal;
  date: string;
  isRecurring: boolean;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      rehearsals: {
        Row: Rehearsal;
        Insert: Omit<Rehearsal, "id" | "created_at">;
        Update: Partial<Omit<Rehearsal, "id" | "created_at">>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at">;
        Update: Partial<Omit<Event, "id" | "created_at">>;
      };
      attendances: {
        Row: Attendance;
        Insert: Omit<Attendance, "id" | "created_at">;
        Update: Partial<Omit<Attendance, "id" | "created_at">>;
      };
      announcements: {
        Row: Announcement;
        Insert: Omit<Announcement, "id" | "created_at">;
        Update: Partial<Omit<Announcement, "id" | "created_at">>;
      };
      announcement_reads: {
        Row: AnnouncementRead;
        Insert: Omit<AnnouncementRead, "id" | "read_at">;
        Update: never;
      };
    };
  };
};
