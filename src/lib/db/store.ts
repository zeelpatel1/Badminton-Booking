// In-memory data store (would be replaced with real database)
import type { Court, Equipment, Coach, CoachAvailability, PricingRule, Booking, WaitlistEntry } from "./schema"
import { seedCourts, seedEquipment, seedCoaches, seedCoachAvailability, seedPricingRules } from "./seed-data"

// In-memory storage
const store = {
  courts: [...seedCourts] as Court[],
  equipment: [...seedEquipment] as Equipment[],
  coaches: [...seedCoaches] as Coach[],
  coachAvailability: [...seedCoachAvailability] as CoachAvailability[],
  pricingRules: [...seedPricingRules] as PricingRule[],
  bookings: [] as Booking[],
  waitlist: [] as WaitlistEntry[],
}

export const db = {
  // Courts
  getCourts: () => store.courts.filter((c) => c.isActive),
  getCourt: (id: string) => store.courts.find((c) => c.id === id),
  addCourt: (court: Court) => {
    store.courts.push(court)
    return court
  },
  updateCourt: (id: string, updates: Partial<Court>) => {
    const index = store.courts.findIndex((c) => c.id === id)
    if (index !== -1) {
      store.courts[index] = { ...store.courts[index], ...updates }
      return store.courts[index]
    }
    return null
  },

  // Equipment
  getEquipment: () => store.equipment.filter((e) => e.isActive),
  getEquipmentById: (id: string) => store.equipment.find((e) => e.id === id),
  addEquipment: (equipment: Equipment) => {
    store.equipment.push(equipment)
    return equipment
  },
  updateEquipment: (id: string, updates: Partial<Equipment>) => {
    const index = store.equipment.findIndex((e) => e.id === id)
    if (index !== -1) {
      store.equipment[index] = { ...store.equipment[index], ...updates }
      return store.equipment[index]
    }
    return null
  },

  // Coaches
  getCoaches: () => store.coaches.filter((c) => c.isActive),
  getCoach: (id: string) => store.coaches.find((c) => c.id === id),
  addCoach: (coach: Coach) => {
    store.coaches.push(coach)
    return coach
  },
  updateCoach: (id: string, updates: Partial<Coach>) => {
    const index = store.coaches.findIndex((c) => c.id === id)
    if (index !== -1) {
      store.coaches[index] = { ...store.coaches[index], ...updates }
      return store.coaches[index]
    }
    return null
  },

  // Coach Availability
  getCoachAvailability: (coachId: string) => store.coachAvailability.filter((a) => a.coachId === coachId),
  addCoachAvailability: (availability: CoachAvailability) => {
    store.coachAvailability.push(availability)
    return availability
  },
  updateCoachAvailability: (id: string, updates: Partial<CoachAvailability>) => {
    const index = store.coachAvailability.findIndex((a) => a.id === id)
    if (index !== -1) {
      store.coachAvailability[index] = { ...store.coachAvailability[index], ...updates }
      return store.coachAvailability[index]
    }
    return null
  },

  // Pricing Rules
  getPricingRules: () => store.pricingRules.filter((r) => r.isActive).sort((a, b) => a.priority - b.priority),
  getPricingRule: (id: string) => store.pricingRules.find((r) => r.id === id),
  addPricingRule: (rule: PricingRule) => {
    store.pricingRules.push(rule)
    return rule
  },
  updatePricingRule: (id: string, updates: Partial<PricingRule>) => {
    const index = store.pricingRules.findIndex((r) => r.id === id)
    if (index !== -1) {
      store.pricingRules[index] = { ...store.pricingRules[index], ...updates }
      return store.pricingRules[index]
    }
    return null
  },

  // Bookings
  getBookings: () => store.bookings,
  getBooking: (id: string) => store.bookings.find((b) => b.id === id),
  getBookingsByDate: (date: string) => store.bookings.filter((b) => b.date === date && b.status === "confirmed"),
  getBookingsByUser: (userId: string) =>
    store.bookings
      .filter((b) => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  addBooking: (booking: Booking) => {
    store.bookings.push(booking)
    return booking
  },
  updateBooking: (id: string, updates: Partial<Booking>) => {
    const index = store.bookings.findIndex((b) => b.id === id)
    if (index !== -1) {
      store.bookings[index] = { ...store.bookings[index], ...updates }
      return store.bookings[index]
    }
    return null
  },

  // Waitlist
  getWaitlist: () => store.waitlist,
  getWaitlistBySlot: (courtId: string, date: string, startTime: string, endTime: string) =>
    store.waitlist
      .filter(
        (w) =>
          w.courtId === courtId &&
          w.date === date &&
          w.startTime === startTime &&
          w.endTime === endTime &&
          w.status === "waiting",
      )
      .sort((a, b) => a.position - b.position),
  addToWaitlist: (entry: WaitlistEntry) => {
    store.waitlist.push(entry)
    return entry
  },
  updateWaitlistEntry: (id: string, updates: Partial<WaitlistEntry>) => {
    const index = store.waitlist.findIndex((w) => w.id === id)
    if (index !== -1) {
      store.waitlist[index] = { ...store.waitlist[index], ...updates }
      return store.waitlist[index]
    }
    return null
  },
}
