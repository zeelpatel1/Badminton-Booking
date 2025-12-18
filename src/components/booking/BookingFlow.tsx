// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import { CalendarSelector } from "@/components/booking/CalendarSelector";
// import { CourtDialog } from "./CourtDialog";
// import { TimeSlotDialog } from "./TimeSlotDialog";
// import { EquipmentDialog } from "./EquipmentDialog";
// import { CoachDialog } from "./CoachDialog";
// import {ConfirmationDialog} from "./ConfirmationDialog";
// import { Slot, Court, Equipment, Coach } from "./types";

// function generateTimeSlots(startHour = 6, endHour = 22): Slot[] {
//   const slots: Slot[] = [];
//   for (let h = startHour; h < endHour; h++) {
//     slots.push({ start: `${String(h).padStart(2, "0")}:00`, end: `${String(h+1).padStart(2,"0")}:00` });
//   }
//   return slots;
// }

// export default function BookingFlow() {
//   const [date, setDate] = useState<Date>();
//   const [slots] = useState<Slot[]>(generateTimeSlots());

//   const [courtDialogOpen, setCourtDialogOpen] = useState(false);
//   const [timeDialogOpen, setTimeDialogOpen] = useState(false);
//   const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
//   const [coachDialogOpen, setCoachDialogOpen] = useState(false);
//   const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

//   const [courts, setCourts] = useState<Court[]>([]);
//   const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

//   const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
//   const [blockedSlots, setBlockedSlots] = useState<string[]>([]);

//   const [equipment, setEquipment] = useState<Equipment[]>([]);
//   const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);

//   const [coaches, setCoaches] = useState<Coach[]>([]);
//   const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

//   const [price, setPrice] = useState<number | null>(null);
//   const [dbUser, setDbUser] = useState<any>(null);

//   useEffect(() => {
//     fetch("/api/me").then(res => res.json()).then(data => setDbUser(data));
//   }, []);

//   // Price calculation
//   useEffect(() => {
//     if (!selectedCourt || !selectedSlot) return;
//     const equipmentTotal = selectedEquipment.reduce((sum, e) => sum + e.price, 0);
//     const start = new Date(`1970-01-01T${selectedSlot.start}:00`);
//     const end = new Date(`1970-01-01T${selectedSlot.end}:00`);
//     const duration = (end.getTime() - start.getTime()) / (1000*60*60);
//     setPrice(selectedCourt.basePrice + equipmentTotal + (selectedCoach ? selectedCoach.pricePerHour * duration : 0));
//   }, [selectedCourt, selectedSlot, selectedEquipment, selectedCoach]);

//   // Handlers
//   const handleDateSelect = async (d?: Date) => {
//     if (!d) return;
//     setDate(d);
//     setCourtDialogOpen(true);
//     setSelectedCourt(null);
//     setSelectedSlot(null);
//     setPrice(null);
//     const dateStr = d.toISOString().split("T")[0];
//     const res = await fetch(`/api/courts?date=${dateStr}`);
//     setCourts(await res.json());
//   };

//   const handleCourtSelect = async (court: Court) => {
//     if (!date) return;
//     setSelectedCourt(court);
//     setCourtDialogOpen(false);
//     setTimeDialogOpen(true);
//     setSelectedSlot(null);
//     setBlockedSlots([]);
//     const dateStr = date.toISOString().split("T")[0];
//     const blocked: string[] = [];
//     for (const slot of slots) {
//       const res = await fetch(`/api/availability?courtId=${court.id}&date=${dateStr}&startTime=${slot.start}&endTime=${slot.end}`);
//       const data = await res.json();
//       if (!data.available) blocked.push(slot.start);
//     }
//     setBlockedSlots(blocked);
//   };

//   const proceedToEquipment = async () => {
//     if (!selectedSlot || !date) return;
//     setTimeDialogOpen(false);
//     setEquipmentDialogOpen(true);
//     const dateStr = date.toISOString().split("T")[0];
//     const res = await fetch(`/api/equipment/availability?date=${dateStr}&startTime=${selectedSlot.start}&endTime=${selectedSlot.end}`);
//     setEquipment(await res.json());
//   };

//   const proceedToCoach = async () => {
//     if (!selectedSlot || !date) return;
//     setEquipmentDialogOpen(false);
//     setCoachDialogOpen(true);
//     const dateStr = date.toISOString().split("T")[0];
//     const res = await fetch(`/api/admin/coaches/availability?date=${dateStr}&startTime=${selectedSlot.start}&endTime=${selectedSlot.end}`);
//     setCoaches(await res.json());
//   };

//   const toggleEquipment = (e: Equipment) => {
//     setSelectedEquipment(prev => prev.some(x => x.id === e.id) ? prev.filter(x => x.id !== e.id) : [...prev, e]);
//   };

//   const handleNextStep = () => setConfirmationDialogOpen(true);

//   const confirmBooking = async () => {
//     if (!selectedCourt || !selectedSlot || !date) return;
//     const bookingData = {
//       userId: dbUser.id,
//       courtId: selectedCourt.id,
//       date: date.toISOString().split("T")[0],
//       startTime: selectedSlot.start,
//       endTime: selectedSlot.end,
//       equipment: selectedEquipment.map(e => ({ equipmentId: e.id, quantity: 1 })),
//       coachId: selectedCoach?.id ?? null,
//     };
//     try {
//       const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bookingData) });
//       if (!res.ok) throw new Error("Booking failed");
//       alert("🎉 Booking Confirmed!");
//       // Reset
//       setDate(undefined); setSelectedCourt(null); setSelectedSlot(null);
//       setSelectedEquipment([]); setSelectedCoach(null); setPrice(null);
//       setCourtDialogOpen(false); setTimeDialogOpen(false);
//       setEquipmentDialogOpen(false); setCoachDialogOpen(false); setConfirmationDialogOpen(false);
//     } catch (err) { console.error(err); alert("Booking failed. Please try again."); }
//   };

//   return (
//     <>
//       <CalendarSelector selectedDate={date} onSelectDate={handleDateSelect} />
//       <CourtDialog open={courtDialogOpen} onOpenChange={setCourtDialogOpen} courts={courts} onSelectCourt={handleCourtSelect} />
//       <TimeSlotDialog open={timeDialogOpen} onOpenChange={setTimeDialogOpen} slots={slots} blockedSlots={blockedSlots} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} onContinue={proceedToEquipment} />
//       <EquipmentDialog open={equipmentDialogOpen} onOpenChange={setEquipmentDialogOpen} equipment={equipment} selectedEquipment={selectedEquipment} onToggleEquipment={toggleEquipment} onContinue={proceedToCoach} />
//       <CoachDialog open={coachDialogOpen} onOpenChange={setCoachDialogOpen} coaches={coaches} selectedCoach={selectedCoach} onSelectCoach={setSelectedCoach} onNext={handleNextStep} price={price} />
//       <ConfirmationDialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen} court={selectedCourt} slot={selectedSlot} equipment={selectedEquipment} coach={selectedCoach} price={price} date={date} onConfirm={confirmBooking} />
//     </>
//   );
// }
