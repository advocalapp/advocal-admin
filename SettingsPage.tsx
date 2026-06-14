// Shared types matching the main app's Supabase schema

export type SubscriptionStatus = 'none' | 'trial' | 'premium' | 'expired'
export type UserRole = 'user' | 'admin'
export type CaseStatus = 'pending' | 'ongoing' | 'completed' | 'adjourned' | 'urgent'

export interface Profile {
  id: string
  email: string | null
  role: UserRole
  full_name: string | null
  bar_registration_number: string | null
  chamber_name: string | null
  chamber_address: string | null
  chamber_phone: string | null
  profile_photo_url: string | null
  subscription_plan: string
  subscription_status: SubscriptionStatus
  subscription_start_date: string | null
  subscription_end_date: string | null
  trial_start_date: string | null
  signup_date: string | null
  created_at: string
  updated_at: string
  is_suspended?: boolean
  city?: string | null
  phone_number?: string | null
}

export interface Case {
  id: string
  user_id: string
  case_title: string
  case_type: string | null
  case_number: string | null
  cnr_number: string | null
  court_name: string
  status: CaseStatus
  hearing_date: string | null
  next_hearing_date: string | null
  created_at: string
}

export interface HearingHistory {
  id: string
  case_id: string
  user_id: string
  hearing_date: string
  outcome: string | null
  notes: string | null
  created_at: string
}

export interface AdminNotification {
  id: string
  title: string
  message: string
  target_audience: 'all' | 'trial' | 'premium' | 'selected'
  target_user_ids: string[] | null
  scheduled_at: string | null
  sent_at: string | null
  status: 'pending' | 'sent' | 'failed' | 'scheduled'
  sent_count: number
  created_by: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  actor_id: string | null
  actor_email: string | null
  action_type: string
  action_detail: Record<string, unknown> | null
  created_at: string
}

export interface DashboardStats {
  total_advocates: number
  active_users: number
  paid_users: number
  trial_users: number
  expired_users: number
  none_users: number
  total_cases: number
  total_hearings: number
  todays_hearings: number
  new_users_month: number
  cases_this_month: number
  cases_by_type: Record<string, number> | null
}

export interface AdminSettings {
  key: string
  value: unknown
  updated_at: string
}
