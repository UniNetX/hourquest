export type UserType = "hs_student" | "partner";

export type PartnerOrgStatus = "pending" | "approved" | "rejected";

export type ChallengeTrack = "environmental" | "medical" | "partnership";

export type EnvironmentalChallengeCategory =
  | "cleanup"
  | "plant"
  | "waste"
  | "water"
  | "social"
  | "community";

export type MedicalChallengeCategory =
  | "health_education"
  | "wellness"
  | "first_aid"
  | "mental_health"
  | "nutrition"
  | "community_health";

export type PartnershipChallengeCategory =
  | "community_service"
  | "education"
  | "fundraising"
  | "outreach"
  | "wellness_partner"
  | "other";

export type ChallengeCategory =
  | EnvironmentalChallengeCategory
  | MedicalChallengeCategory
  | PartnershipChallengeCategory;

export type ChallengeDifficulty = "easy" | "medium" | "hard";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface PartnerOrganization {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  status: PartnerOrgStatus;
  owner_user_id: string;
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  proof_instructions: string | null;
  track: ChallengeTrack;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  hours_earned: number;
  points: number;
  active: boolean;
  sort_order: number;
  total_submissions: number;
  partner_org_id: string | null;
  created_at: string;
  updated_at: string;
  partner_organization?: Pick<
    PartnerOrganization,
    "id" | "name" | "logo_url" | "description"
  > | null;
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

export interface HomepageTestimonial {
  id: string;
  rating: number;
  comment: string;
  display_name: string;
  display_school: string;
  sort_order: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
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
  show_on_homepage?: boolean;
  homepage_sort_order?: number;
  display_name?: string | null;
  display_school?: string | null;
}

export interface Profile {
  id: string;
  full_name: string;
  school_name: string | null;
  avatar_url: string | null;
  total_verified_hours: number;
  week_streak: number;
  is_public: boolean;
  user_type: UserType;
  partner_org_id: string | null;
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
      partner_organizations: {
        Row: PartnerOrganization;
        Insert: Partial<PartnerOrganization> & Pick<PartnerOrganization, "name" | "owner_user_id">;
        Update: Partial<PartnerOrganization>;
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
        Args: { p_track: string; p_category: string; p_ordered_ids: string[] };
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
      admin_review_partner_org: {
        Args: {
          p_org_id: string;
          p_action: string;
          p_rejection_reason?: string | null;
        };
        Returns: PartnerOrganization;
      };
      admin_list_partner_orgs: {
        Args: { p_status?: string | null };
        Returns: PartnerOrganization[];
      };
      partner_upsert_challenge: {
        Args: { p_payload: Record<string, unknown> };
        Returns: Challenge;
      };
      partner_delete_challenge: {
        Args: { p_challenge_id: string };
        Returns: void;
      };
      partner_reorder_challenges: {
        Args: { p_category: string; p_ordered_ids: string[] };
        Returns: void;
      };
    };
    Enums: {
      challenge_submission_status: SubmissionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
