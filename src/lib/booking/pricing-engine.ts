// Pricing calculation engine
import type { Court } from "../db/schema"
import { db } from "../db/store"

const BASE_COURT_PRICE = 30 // Base price per hour

interface PriceCalculationInput {
  court: Court
  date: string
  startTime: string
  endTime: string
  equipmentIds: string[]
  coachId?: string
}

interface PriceBreakdown {
  courtPrice: number
  equipmentPrice: number
  coachPrice: number
  appliedRules: { ruleName: string; amount: number }[]
  totalPrice: number
}

function getHoursBetween(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)
  return (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60
}

function getDayOfWeek(dateString: string): number {
  return new Date(dateString).getDay()
}

function timeInRange(time: string, startTime: string, endTime: string): boolean {
  const [hour, min] = time.split(":").map(Number)
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)

  const timeMinutes = hour * 60 + min
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  return timeMinutes >= startMinutes && timeMinutes < endMinutes
}

export function calculatePrice(input: PriceCalculationInput): PriceBreakdown {
  const { court, date, startTime, endTime, equipmentIds, coachId } = input
  const hours = getHoursBetween(startTime, endTime)
  const dayOfWeek = getDayOfWeek(date)

  // Base court price
  let courtPrice = BASE_COURT_PRICE * hours

  // Get active pricing rules
  const rules = db.getPricingRules()
  const appliedRules: { ruleName: string; amount: number }[] = []

  // Apply rules in priority order
  for (const rule of rules) {
    let shouldApply = false
    let ruleAmount = 0

    switch (rule.type) {
      case "peak_hours":
        if (rule.conditions.startTime && rule.conditions.endTime) {
          shouldApply = timeInRange(startTime, rule.conditions.startTime, rule.conditions.endTime)
        }
        break

      case "weekend":
        if (rule.conditions.daysOfWeek) {
          shouldApply = rule.conditions.daysOfWeek.includes(dayOfWeek)
        }
        break

      case "court_type":
        shouldApply = rule.conditions.courtType === court.type
        break

      case "custom":
        // Custom rules can be implemented based on specific needs
        break
    }

    if (shouldApply) {
      if (rule.multiplier) {
        ruleAmount = courtPrice * (rule.multiplier - 1)
        courtPrice *= rule.multiplier
      } else if (rule.fixedAmount) {
        ruleAmount = rule.fixedAmount * hours
        courtPrice += ruleAmount
      }

      appliedRules.push({
        ruleName: rule.name,
        amount: ruleAmount,
      })
    }
  }

  // Calculate equipment price
  let equipmentPrice = 0
  for (const equipId of equipmentIds) {
    const equipment = db.getEquipmentById(equipId)
    if (equipment) {
      equipmentPrice += equipment.pricePerHour * hours
    }
  }

  // Calculate coach price
  let coachPrice = 0
  if (coachId) {
    const coach = db.getCoach(coachId)
    if (coach) {
      coachPrice = coach.pricePerHour * hours
    }
  }

  const totalPrice = courtPrice + equipmentPrice + coachPrice

  return {
    courtPrice: Math.round(courtPrice * 100) / 100,
    equipmentPrice: Math.round(equipmentPrice * 100) / 100,
    coachPrice: Math.round(coachPrice * 100) / 100,
    appliedRules,
    totalPrice: Math.round(totalPrice * 100) / 100,
  }
}
