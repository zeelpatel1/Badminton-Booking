// Seed data for the platform
import type { Court, Equipment, Coach, CoachAvailability, PricingRule } from "./schema"

export const seedCourts: Court[] = [
  {
    id: "court-1",
    name: "Indoor Court 1",
    type: "indoor",
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "court-2",
    name: "Indoor Court 2",
    type: "indoor",
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "court-3",
    name: "Outdoor Court 1",
    type: "outdoor",
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "court-4",
    name: "Outdoor Court 2",
    type: "outdoor",
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
]

export const seedEquipment: Equipment[] = [
  {
    id: "equip-1",
    name: "Professional Racket",
    category: "racket",
    quantity: 10,
    pricePerHour: 5,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "equip-2",
    name: "Beginner Racket",
    category: "racket",
    quantity: 15,
    pricePerHour: 3,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "equip-3",
    name: "Court Shoes",
    category: "shoes",
    quantity: 20,
    pricePerHour: 4,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
]

export const seedCoaches: Coach[] = [
  {
    id: "coach-1",
    name: "Sarah Johnson",
    specialty: "Singles & Technique",
    pricePerHour: 50,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "coach-2",
    name: "Mike Chen",
    specialty: "Doubles & Strategy",
    pricePerHour: 45,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "coach-3",
    name: "Emily Davis",
    specialty: "Beginners & Kids",
    pricePerHour: 40,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
]

export const seedCoachAvailability: CoachAvailability[] = [
  // Sarah Johnson - Mon, Wed, Fri 8am-8pm
  { id: "avail-1", coachId: "coach-1", dayOfWeek: 1, startTime: "08:00", endTime: "20:00" },
  { id: "avail-2", coachId: "coach-1", dayOfWeek: 3, startTime: "08:00", endTime: "20:00" },
  { id: "avail-3", coachId: "coach-1", dayOfWeek: 5, startTime: "08:00", endTime: "20:00" },
  // Mike Chen - Tue, Thu, Sat 9am-7pm
  { id: "avail-4", coachId: "coach-2", dayOfWeek: 2, startTime: "09:00", endTime: "19:00" },
  { id: "avail-5", coachId: "coach-2", dayOfWeek: 4, startTime: "09:00", endTime: "19:00" },
  { id: "avail-6", coachId: "coach-2", dayOfWeek: 6, startTime: "09:00", endTime: "19:00" },
  // Emily Davis - Mon-Fri 10am-6pm
  { id: "avail-7", coachId: "coach-3", dayOfWeek: 1, startTime: "10:00", endTime: "18:00" },
  { id: "avail-8", coachId: "coach-3", dayOfWeek: 2, startTime: "10:00", endTime: "18:00" },
  { id: "avail-9", coachId: "coach-3", dayOfWeek: 3, startTime: "10:00", endTime: "18:00" },
  { id: "avail-10", coachId: "coach-3", dayOfWeek: 4, startTime: "10:00", endTime: "18:00" },
  { id: "avail-11", coachId: "coach-3", dayOfWeek: 5, startTime: "10:00", endTime: "18:00" },
]

export const seedPricingRules: PricingRule[] = [
  {
    id: "rule-1",
    name: "Peak Hours Premium",
    type: "peak_hours",
    description: "Higher rates during 6-9 PM",
    multiplier: 1.5,
    isActive: true,
    priority: 1,
    conditions: {
      startTime: "18:00",
      endTime: "21:00",
    },
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "rule-2",
    name: "Weekend Surcharge",
    type: "weekend",
    description: "Higher rates on weekends",
    multiplier: 1.3,
    isActive: true,
    priority: 2,
    conditions: {
      daysOfWeek: [0, 6], // Sunday, Saturday
    },
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "rule-3",
    name: "Indoor Court Premium",
    type: "court_type",
    description: "Premium for indoor courts",
    fixedAmount: 10,
    isActive: true,
    priority: 3,
    conditions: {
      courtType: "indoor",
    },
    createdAt: new Date("2024-01-01"),
  },
]
