export type RoleName = "super_admin" | "institution_admin" | "counsellor" | "admission_manager";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: RoleName | null;
  institution_id: string;
  is_active: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
}

export interface Institution {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  institution_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  academic_background: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  institution_id: string;
  name: string;
  code: string;
  description: string | null;
  duration_months: number;
  fee: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type InquiryStatus =
  | "new"
  | "contacted"
  | "interested"
  | "follow_up_scheduled"
  | "application_submitted"
  | "admission_confirmed"
  | "not_interested"
  | "unreachable"
  | "on_hold"
  | "lost";

export interface Inquiry {
  id: string;
  institution_id: string;
  student_id: string | null;
  assigned_to: string | null;
  course_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: InquiryStatus;
  notes: string | null;
  lost_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  institution_id: string;
  inquiry_id: string;
  assigned_to: string;
  due_at: string;
  channel: string | null;
  purpose: string | null;
  status: "pending" | "completed" | "cancelled";
  outcome: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface InquiryActivity {
  id: string;
  inquiry_id: string;
  actor_id: string | null;
  activity_type: string;
  from_status: string | null;
  to_status: string | null;
  notes: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface Enrollment {
  id: string;
  institution_id: string;
  student_id: string;
  inquiry_id: string;
  course_id: string;
  enrollment_date: string;
  status: string;
  fee_agreed: number | null;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface DashboardAnalytics {
  total: number;
  new: number;
  contacted: number;
  interested: number;
  follow_up_scheduled: number;
  application_submitted: number;
  admission_confirmed: number;
  lost: number;
  conversion_percentage: number;
  overdue_follow_ups: number;
  status_breakdown: { status: string; count: number }[];
  source_breakdown: { source: string; count: number }[];
  trend: { day: string; count: number }[];
}

export interface ConversionReport {
  total_inquiries: number;
  applications: number;
  admissions: number;
  inquiry_to_application_percentage: number;
  application_to_admission_percentage: number;
  overall_conversion_percentage: number;
  by_source: { source: string; count: number }[];
  by_course: { course: string; count: number }[];
  by_counsellor: { counsellor: string; count: number }[];
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
