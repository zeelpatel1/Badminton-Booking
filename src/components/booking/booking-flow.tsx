"use client"

import { useState } from "react"
import { DateTimeSelector } from "./date-time-selector"
import { CourtSelector } from "./court-selector"
import { EquipmentSelector } from "./equipment-selector"
import { CoachSelector } from "./coach-selector"
import { PriceSummary } from "./price-summary"
import { BookingConfirmation } from "./booking-confirmation"

export function BookingFlow() {
  const [step, setStep] = useState<"datetime" | "court" | "extras" | "confirm">("datetime")
  const [bookingData, setBookingData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    courtId: "",
    equipmentIds: [] as string[],
    coachId: undefined as string | undefined,
    userId: "user-demo",
    userName: "Demo User",
    userEmail: "demo@example.com",
  })

  function handleDateTimeSelect(date: string, startTime: string, endTime: string) {
    setBookingData({ ...bookingData, date, startTime, endTime })
    setStep("court")
  }

  function handleCourtSelect(courtId: string) {
    setBookingData({ ...bookingData, courtId })
    setStep("extras")
  }

  function handleEquipmentChange(equipmentIds: string[]) {
    setBookingData({ ...bookingData, equipmentIds })
  }

  function handleCoachChange(coachId: string | undefined) {
    setBookingData({ ...bookingData, coachId })
  }

  function handleConfirm() {
    setStep("confirm")
  }

  function handleReset() {
    setBookingData({
      date: "",
      startTime: "",
      endTime: "",
      courtId: "",
      equipmentIds: [],
      coachId: undefined,
      userId: "user-demo",
      userName: "Demo User",
      userEmail: "demo@example.com",
    })
    setStep("datetime")
  }

  return (
    <div className="mx-auto max-w-5xl">
      {step === "confirm" ? (
        <BookingConfirmation bookingData={bookingData} onReset={handleReset} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <DateTimeSelector
              onSelect={handleDateTimeSelect}
              selectedDate={bookingData.date}
              selectedStartTime={bookingData.startTime}
              selectedEndTime={bookingData.endTime}
              disabled={step !== "datetime"}
            />

            {step !== "datetime" && (
              <CourtSelector
                date={bookingData.date}
                startTime={bookingData.startTime}
                endTime={bookingData.endTime}
                selectedCourtId={bookingData.courtId}
                onSelect={handleCourtSelect}
                disabled={step !== "court"}
              />
            )}

            {(step === "extras" || step === "confirm") && (
              <>
                <EquipmentSelector
                  date={bookingData.date}
                  startTime={bookingData.startTime}
                  endTime={bookingData.endTime}
                  selectedEquipmentIds={bookingData.equipmentIds}
                  onSelectionChange={handleEquipmentChange}
                />

                <CoachSelector
                  date={bookingData.date}
                  startTime={bookingData.startTime}
                  endTime={bookingData.endTime}
                  selectedCoachId={bookingData.coachId}
                  onSelectionChange={handleCoachChange}
                />
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <PriceSummary bookingData={bookingData} onConfirm={handleConfirm} canConfirm={step === "extras"} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
