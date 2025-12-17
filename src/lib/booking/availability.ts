// Availability checking logic
import { db } from "../db/store"

export interface AvailabilityCheck {
  courtId: string
  date: string
  startTime: string
  endTime: string
  equipmentIds: string[]
  coachId?: string
}

export interface AvailabilityResult {
  available: boolean
  conflicts: string[]
}

function timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
  const [s1h, s1m] = start1.split(":").map(Number)
  const [e1h, e1m] = end1.split(":").map(Number)
  const [s2h, s2m] = start2.split(":").map(Number)
  const [e2h, e2m] = end2.split(":").map(Number)

  const s1 = s1h * 60 + s1m
  const e1 = e1h * 60 + e1m
  const s2 = s2h * 60 + s2m
  const e2 = e2h * 60 + e2m

  return s1 < e2 && s2 < e1
}

function getDayOfWeek(dateString: string): number {
  return new Date(dateString).getDay()
}

export function checkAvailability(check: AvailabilityCheck): AvailabilityResult {
  const { courtId, date, startTime, endTime, equipmentIds, coachId } = check
  const conflicts: string[] = []

  // Check court availability
  const courtBookings = db.getBookingsByDate(date).filter((b) => b.courtId === courtId)
  const courtConflict = courtBookings.some((b) => timeOverlaps(startTime, endTime, b.startTime, b.endTime))
  if (courtConflict) {
    conflicts.push("Court is already booked for this time slot")
  }

  // Check equipment availability
  const equipmentCounts = new Map<string, number>()
  for (const booking of db.getBookingsByDate(date)) {
    if (timeOverlaps(startTime, endTime, booking.startTime, booking.endTime)) {
      for (const equipId of booking.equipmentIds) {
        equipmentCounts.set(equipId, (equipmentCounts.get(equipId) || 0) + 1)
      }
    }
  }

  for (const equipId of equipmentIds) {
    const equipment = db.getEquipmentById(equipId)
    if (!equipment) {
      conflicts.push(`Equipment ${equipId} not found`)
      continue
    }

    const currentlyBooked = equipmentCounts.get(equipId) || 0
    if (currentlyBooked >= equipment.quantity) {
      conflicts.push(`${equipment.name} is fully booked for this time slot`)
    }
  }

  // Check coach availability
  if (coachId) {
    const coach = db.getCoach(coachId)
    if (!coach) {
      conflicts.push("Coach not found")
    } else {
      // Check if coach is available on this day/time
      const dayOfWeek = getDayOfWeek(date)
      const availability = db.getCoachAvailability(coachId)
      const availableOnDay = availability.some((a) => {
        if (a.dayOfWeek !== dayOfWeek) return false
        return timeOverlaps(startTime, endTime, a.startTime, a.endTime)
      })

      if (!availableOnDay) {
        conflicts.push(`${coach.name} is not available on this day/time`)
      }

      // Check if coach is already booked
      const coachBookings = db.getBookingsByDate(date).filter((b) => b.coachId === coachId)
      const coachConflict = coachBookings.some((b) => timeOverlaps(startTime, endTime, b.startTime, b.endTime))
      if (coachConflict) {
        conflicts.push(`${coach.name} is already booked for this time slot`)
      }
    }
  }

  return {
    available: conflicts.length === 0,
    conflicts,
  }
}

export function getAvailableCourts(date: string, startTime: string, endTime: string): string[] {
  const courts = db.getCourts()
  const available: string[] = []

  for (const court of courts) {
    const result = checkAvailability({
      courtId: court.id,
      date,
      startTime,
      endTime,
      equipmentIds: [],
      coachId: undefined,
    })
    if (result.available) {
      available.push(court.id)
    }
  }

  return available
}
