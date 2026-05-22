import { Timestamp } from "firebase/firestore";

// ==================== CUSTOMER ====================
export interface Customer {
  id?: string;
  name: string;
  phone: string;
  email?: string | null;
  stamps: number;
  totalVisits: number;
  lastVisit: Timestamp | Date;
  rewardsClaimed: number;
  createdAt: Timestamp | Date;
  birthday?: Timestamp | Date | null;
  referralCode: string;
  referredBy?: string | null;
  referralCount: number;
  fcmToken?: string | null;
  pushEnabled: boolean;
  isDeleted: boolean;
}

// ==================== STAFF ====================
export interface Staff {
  id?: string;
  name: string;
  pin: string; // SHA-256 hashed
  totalStampsGiven: number;
  isActive: boolean;
  createdAt: Timestamp | Date;
}

// ==================== STAMP LOG ====================
export type StampLogType = "stamp" | "reward_claimed" | "manual_adjustment";

export interface StampLog {
  id?: string;
  customerId: string;
  customerName?: string;
  staffId: string;
  staffName?: string;
  timestamp: Timestamp | Date;
  type: StampLogType;
  adminNote?: string | null;
}

// ==================== SETTINGS ====================
export interface WhatsAppConfig {
  apiKey: string;
  senderId: string;
  provider: "meta" | "twilio";
}

export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export interface Settings {
  stampsRequired: number;
  rewardDescription: string;
  googleMapsUrl: string;
  referralBonus: number;
  whatsappConfig?: WhatsAppConfig;
  emailConfig?: EmailConfig;
  businessName: string;
  businessPhone: string;
}

// ==================== REWARDS ====================
export type RewardType = "stamp" | "birthday" | "milestone";

export interface Reward {
  id?: string;
  title: string;
  stampsRequired: number;
  description: string;
  isActive: boolean;
  type: RewardType;
  milestoneVisits?: number; // for milestone type
}

// ==================== REWARD CODES ====================
export interface RewardCode {
  id?: string;
  code: string;
  customerId: string;
  customerName?: string;
  rewardId?: string;
  rewardTitle?: string;
  createdAt: Timestamp | Date;
  expiresAt: Timestamp | Date;
  isUsed: boolean;
  usedAt?: Timestamp | Date | null;
  usedByStaffId?: string;
}

// ==================== CAMPAIGNS ====================
export type CampaignChannel = "whatsapp" | "email" | "push" | "all";
export type CampaignSegment =
  | "inactive_14_days"
  | "no_rewards"
  | "all_customers"
  | "custom";
export type CampaignStatus = "draft" | "sent" | "failed";

export interface Campaign {
  id?: string;
  message: string;
  channel: CampaignChannel;
  segment: CampaignSegment;
  segmentLabel?: string;
  sentCount: number;
  targetCount: number;
  createdAt: Timestamp | Date;
  status: CampaignStatus;
}

// ==================== FEEDBACK ====================
export interface Feedback {
  id?: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  rating: number;
  message: string;
  createdAt: Timestamp | Date;
  isRead: boolean;
}

// ==================== DASHBOARD STATS ====================
export interface DashboardStats {
  todayVisitors: number;
  totalCustomers: number;
  totalRewardsClaimed: number;
  activeCustomers: number;
  weeklyData: WeeklyDataPoint[];
  topCustomers: TopCustomer[];
  staffPerformance: StaffPerformanceItem[];
}

export interface WeeklyDataPoint {
  day: string;
  visits: number;
  newCustomers: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  totalVisits: number;
  stamps: number;
}

export interface StaffPerformanceItem {
  id: string;
  name: string;
  stampsGiven: number;
}
