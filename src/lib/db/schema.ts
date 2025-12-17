// Database schema types and interfaces

export type CourtType = "indoor" | "outdoor"

export interface Court {
  id: string
  name: string
  type: CourtType
  isActive: boolean
  createdAt: Date
}

export interface Equipment {
  id: string
  name: string
  category: "racket" | "shoes" | "other"
  quantity: number
  pricePerHour: number
  isActive: boolean
  createdAt: Date
}

export interface Coach {
  id: string
  name: string
  specialty: string
  pricePerHour: number
  isActive: boolean
  createdAt: Date
}

export interface CoachAvailability {
  id: string
  coachId: string
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:mm format
  endTime: string // HH:mm format
}

export type PricingRuleType = "peak_hours" | "weekend" | "court_type" | "custom"

export interface PricingRule {
  id: string
  name: string
  type: PricingRuleType
  description: string
  multiplier?: number // e.g., 1.5 for 50% increase
  fixedAmount?: number // flat rate addition
  isActive: boolean
  priority: number // lower number = higher priority
  conditions: {
    // For peak_hours
    startTime?: string
    endTime?: string
    // For weekend
    daysOfWeek?: number[]
    // For court_type
    courtType?: CourtType
  }
  createdAt: Date
}

export interface Booking {
  id: string
  courtId: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  userId: string
  userName: string
  userEmail: string
  equipmentIds: string[]
  coachId?: string
  totalPrice: number
  priceBreakdown: {
    courtPrice: number
    equipmentPrice: number
    coachPrice: number
    appliedRules: { ruleName: string; amount: number }[]
  }
  status: "confirmed" | "cancelled"
  createdAt: Date
}

export interface WaitlistEntry {
  id: string
  courtId: string
  date: string
  startTime: string
  endTime: string
  userId: string
  userName: string
  userEmail: string
  equipmentIds: string[]
  coachId?: string
  position: number
  status: "waiting" | "notified" | "expired"
  createdAt: Date
}

export interface BookingSlot {
  time: string
  available: boolean
  courtId?: string
}
