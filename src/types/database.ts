export type ChallengeCategory =
  | "cleanup"
  | "plant"
  | "waste"
  | "water"
  | "social"
  | "community";

export type ChallengeDifficulty = "easy" | "medium" | "hard";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  proof_instructions: string | null;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  hours_earned: number;
  points: number;
  active: boolean;
  sort_order: number;
  total_submissions: number;
  created_at: string;
  updated_at: string;
}

export interface ChallengeSubmission {
  id: string;
  user_id: string;
  challenge_id: string;
  challenge_title: string;
  challenge_category: ChallengeCategory;
  hours_awarded: number | null;
  points_awarded: number | null;
  photo_paths: string[];
  description: string | null;
  date_completed: string;
  status: SubmissionStatus;
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface StudentStory {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  approved: boolean;
  submitted_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export interface Profile {
  id: string;
  full_name: string;
  school_name: string | null;
  avatar_url: string | null;
  total_verified_hours: number;
  week_streak: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  milestone: number;
  pdf_url: string | null;
  cert_id: string;
  created_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: string;
  earned_at: string;
}

export type Database = {
  public: {
    Tables: {
      challenges: {
        Row: Challenge;
        Insert: Partial<Challenge> & Pick<Challenge, "title" | "description" | "category" | "difficulty" | "hours_earned" | "points">;
        Update: Partial<Challenge>;
        Relationships: [];
      };
      challenge_submissions: {
        Row: ChallengeSubmission;
        Insert: Partial<ChallengeSubmission> & Pick<ChallengeSubmission, "user_id" | "challenge_id" | "challenge_title" | "challenge_category" | "date_completed">;
        Update: Partial<ChallengeSubmission>;
        Relationships: [];
      };
      student_stories: {
        Row: StudentStory;
        Insert: Partial<StudentStory> & Pick<StudentStory, "user_id" | "rating" | "comment">;
        Update: Partial<StudentStory>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id" | "full_name">;
        Update: Partial<Profile>;
        Relationships: [];
      };
      certificates: {
        Row: Certificate;
        Insert: Partial<Certificate> & Pick<Certificate, "user_id" | "milestone" | "cert_id">;
        Update: Partial<Certificate>;
        Relationships: [];
      };
      badges: {
        Row: Badge;
        Insert: Partial<Badge> & Pick<Badge, "user_id" | "badge_type">;
        Update: Partial<Badge>;
        Relationships: [];
      };
    };
    Views: {
      school_leaderboard: {
        Row: {
          school_name: string;
          student_count: number;
          total_hours: number;
        };
        Relationships: [];
      };
      individual_leaderboard_all_time: {
        Row: {
          id: string;
          full_name: string;
          school_name: string | null;
          avatar_url: string | null;
          total_verified_hours: number;
          rank: number;
        };
        Relationships: [];
      };
      individual_leaderboard_weekly: {
        Row: {
          id: string;
          full_name: string;
          school_name: string | null;
          avatar_url: string | null;
          weekly_hours: number;
          rank: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      admin_review_submission: {
        Args: {
          p_submission_id: string;
          p_action: string;
          p_rejection_reason?: string | null;
        };
        Returns: ChallengeSubmission;
      };
      admin_upsert_challenge: {
        Args: { p_payload: Record<string, unknown> };
        Returns: Challenge;
      };
      admin_reorder_challenges: {
        Args: { p_category: string; p_ordered_ids: string[] };
        Returns: void;
      };
      admin_delete_challenge: {
        Args: { p_challenge_id: string };
        Returns: void;
      };
      admin_moderate_story: {
        Args: { p_story_id: string; p_approved: boolean };
        Returns: StudentStory;
      };
    };
    Enums: {
      challenge_submission_status: SubmissionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
