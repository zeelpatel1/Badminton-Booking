"use client";

import * as React from "react";
import { CalendarSelector } from "@/components/booking/CalendarSelector";
import { CourtDialog } from "@/components/booking/CourtDialog";
import { TimeSlotDialog } from "@/components/booking/TimeSlotDialog";
import { EquipmentDialog } from "@/components/booking/EquipmentDialog";
import { CoachDialog } from "@/components/booking/CoachDialog";
import { ConfirmationDialog } from "@/components/booking/ConfirmationDialog";
import { Slot, Court, Equipment, Coach } from "@/components/booking/types";

function generateTimeSlots(startHour = 6, endHour = 22): Slot[] {
  const slots: Slot[] = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push({ start: `${String(h).padStart(2, "0")}:00`, end: `${String(h + 1).padStart(2, "0")}:00` });
  }
  return slots;
}

export default function BookingFlow() {
  const [date, setDate] = React.useState<Date>();
  const [slots] = React.useState<Slot[]>(generateTimeSlots());

  const [courts, setCourts] = React.useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = React.useState<Court | null>(null);
  const [courtDialogOpen, setCourtDialogOpen] = React.useState(false);

  const [selectedSlot, setSelectedSlot] = React.useState<Slot | null>(null);
  const [blockedSlots, setBlockedSlots] = React.useState<string[]>([]);
  const [timeDialogOpen, setTimeDialogOpen] = React.useState(false);

  const [equipment, setEquipment] = React.useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = React.useState<Equipment[]>([]);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = React.useState(false);

  const [coaches, setCoaches] = React.useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] = React.useState<Coach | null>(null);
  const [coachDialogOpen, setCoachDialogOpen] = React.useState(false);

  const [price, setPrice] = React.useState<number | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = React.useState(false);

  const [dbUser, setDbUser] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("/api/me").then(res => res.json()).then(data => setDbUser(data)).catch(console.error);
  }, []);

  // --- DATE SELECT ---
  const handleDateSelect = async (d?: Date) => {
    if (!d) return;
    setDate(d);
    setCourtDialogOpen(true);
    setSelectedCourt(null);
    setSelectedSlot(null);
    setPrice(null);

    const dateStr = d.toISOString().split("T")[0];
    const res = await fetch(`/api/courts?date=${dateStr}`);
    setCourts(await res.json());
  };

  // --- COURT SELECT ---
  const handleCourtSelect = async (court: Court) => {
    if (!date) return;
    setSelectedCourt(court);
    setCourtDialogOpen(false);
    setTimeDialogOpen(true);
    setSelectedSlot(null);
    setBlockedSlots([]);

    const dateStr = date.toISOString().split("T")[0];
    const blocked: string[] = [];

    for (const slot of slots) {
      const res = await fetch(`/api/availability?courtId=${court.id}&date=${dateStr}&startTime=${slot.start}&endTime=${slot.end}`);
      const data = await res.json();
      if (!data.available) blocked.push(slot.start);
    }

    setBlockedSlots(blocked);
  };

  // --- TIME → EQUIPMENT ---
  const proceedToEquipment = async () => {
    if (!selectedSlot || !date) return;
    setTimeDialogOpen(false);
    setEquipmentDialogOpen(true);

    const dateStr = date.toISOString().split("T")[0];
    const res = await fetch(`/api/equipment/availability?date=${dateStr}&startTime=${selectedSlot.start}&endTime=${selectedSlot.end}`);
    setEquipment(await res.json());
  };

  // --- EQUIPMENT → COACH ---
  const proceedToCoach = async () => {
    if (!selectedSlot || !date) return;
    setEquipmentDialogOpen(false);
    setCoachDialogOpen(true);

    const dateStr = date.toISOString().split("T")[0];
    const res = await fetch(`/api/admin/coaches/availability?date=${dateStr}&startTime=${selectedSlot.start}&endTime=${selectedSlot.end}`);
    setCoaches(await res.json());
  };

  // --- PRICE CALCULATION ---
  React.useEffect(() => {
    if (!selectedCourt || !selectedSlot) return;
    const equipmentTotal = selectedEquipment.reduce((sum, e) => sum + e.price, 0);
    const start = new Date(`1970-01-01T${selectedSlot.start}:00`);
    const end = new Date(`1970-01-01T${selectedSlot.end}:00`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const totalPrice = selectedCourt.basePrice + equipmentTotal + (selectedCoach ? selectedCoach.pricePerHour * durationHours : 0);
    setPrice(totalPrice);
  }, [selectedEquipment, selectedCoach, selectedSlot, selectedCourt]);

  // --- CONFIRMATION ---
  const handleNextStep = () => {
    if (!selectedCourt || !selectedSlot) return;
    setConfirmationDialogOpen(true);
  };

  const confirmBooking = async () => {
    if (!selectedCourt || !selectedSlot || !date) return;

    const bookingData = {
      userId: dbUser.id,
      courtId: selectedCourt.id,
      date: date.toISOString().split("T")[0],
      startTime: selectedSlot.start,
      endTime: selectedSlot.end,
      equipment: selectedEquipment.map(e => ({ equipmentId: e.id, quantity: 1 })),
      coachId: selectedCoach?.id ?? null,
    };

    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bookingData) });
      if (!res.ok) throw new Error("Booking failed");

      alert("🎉 Booking Confirmed!");
      setDate(undefined);
      setSelectedCourt(null);
      setSelectedSlot(null);
      setSelectedEquipment([]);
      setSelectedCoach(null);
      setPrice(null);
      setCourtDialogOpen(false);
      setTimeDialogOpen(false);
      setEquipmentDialogOpen(false);
      setCoachDialogOpen(false);
      setConfirmationDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert("Booking failed. Please try again.");
    }
  };

  // --- RENDER ---
  return (
    <>
      <CalendarSelector selectedDate={date} onSelectDate={handleDateSelect} />

      <CourtDialog courts={courts} open={courtDialogOpen} onOpenChange={setCourtDialogOpen} onSelectCourt={handleCourtSelect} />
      <TimeSlotDialog slots={slots} blockedSlots={blockedSlots} selectedSlot={selectedSlot} open={timeDialogOpen} onOpenChange={setTimeDialogOpen} onSelectSlot={setSelectedSlot} onContinue={proceedToEquipment} />
      <EquipmentDialog equipment={equipment} selectedEquipment={selectedEquipment} open={equipmentDialogOpen} onOpenChange={setEquipmentDialogOpen} onToggleEquipment={(e) => setSelectedEquipment(prev => prev.some(x => x.id === e.id) ? prev.filter(x => x.id !== e.id) : [...prev, e])} onContinue={proceedToCoach} />
      <CoachDialog coaches={coaches} selectedCoach={selectedCoach} open={coachDialogOpen} onOpenChange={setCoachDialogOpen} onSelectCoach={setSelectedCoach} onNext={handleNextStep} price={price} />
      <ConfirmationDialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen} court={selectedCourt} slot={selectedSlot} date={date} equipment={selectedEquipment} coach={selectedCoach} price={price} onConfirm={confirmBooking} />
    </>
  );
}
