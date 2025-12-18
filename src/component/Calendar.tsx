"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ---------------- TYPES ---------------- */

type Slot = {
  start: string;
  end: string;
};

type Court = {
  id: number;
  name: string;
  type: string;
  basePrice: number;
};

type Equipment = {
  id: number;
  name: string;
  price: number;
};

type Coach = {
  id: number;
  name: string;
  pricePerHour: number;
};

/* ---------------- HELPERS ---------------- */

function generateTimeSlots(startHour = 6, endHour = 22): Slot[] {
  const slots: Slot[] = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push({
      start: `${String(h).padStart(2, "0")}:00`,
      end: `${String(h + 1).padStart(2, "0")}:00`,
    });
  }
  return slots;
}

/* ---------------- COMPONENT ---------------- */

export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>();

  const [courtDialogOpen, setCourtDialogOpen] = React.useState(false);
  const [timeDialogOpen, setTimeDialogOpen] = React.useState(false);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = React.useState(false);
  const [coachDialogOpen, setCoachDialogOpen] = React.useState(false);

  const [courts, setCourts] = React.useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = React.useState<Court | null>(null);

  const [selectedSlot, setSelectedSlot] = React.useState<Slot | null>(null);
  const [blockedSlots, setBlockedSlots] = React.useState<string[]>([]);

  const [equipment, setEquipment] = React.useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = React.useState<Equipment[]>(
    []
  );

  const [coaches, setCoaches] = React.useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] = React.useState<Coach | null>(null);

  const [price, setPrice] = React.useState<number | null>(null);

  const slots = React.useMemo(() => generateTimeSlots(), []);

  /* ---------------- DATE SELECT ---------------- */

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

  /* ---------------- COURT SELECT ---------------- */

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
      const res = await fetch(
        `/api/availability?courtId=${court.id}&date=${dateStr}&startTime=${slot.start}&endTime=${slot.end}`
      );
      const data = await res.json();
      if (!data.available) blocked.push(slot.start);
    }

    setBlockedSlots(blocked);
  };

  /* ---------------- TIME → EQUIPMENT ---------------- */

  const proceedToEquipment = async () => {
    if (!selectedSlot || !date) return;

    setTimeDialogOpen(false);
    setEquipmentDialogOpen(true);

    const dateStr = date.toISOString().split("T")[0];
    const res = await fetch(
      `/api/equipment/availability?date=${dateStr}&startTime=${selectedSlot.start}&endTime=${selectedSlot.end}`
    );
    setEquipment(await res.json());
  };

  /* ---------------- EQUIPMENT → COACH ---------------- */

  const proceedToCoach = async () => {
    if (!selectedSlot || !date) return;

    setEquipmentDialogOpen(false);
    setCoachDialogOpen(true);

    const dateStr = date.toISOString().split("T")[0];
    const res = await fetch(
      `/api/admin/coaches/availability?date=${dateStr}&startTime=${selectedSlot.start}&endTime=${selectedSlot.end}`
    );
    setCoaches(await res.json());
  };

  /* ---------------- PRICE ---------------- */

  React.useEffect(() => {
    if (!selectedCourt || !selectedSlot || !date) return;

    const equipmentTotal = selectedEquipment.reduce((sum, e) => sum + e.price, 0);

    const start = new Date(`1970-01-01T${selectedSlot.start}:00`);
    const end = new Date(`1970-01-01T${selectedSlot.end}:00`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const totalPrice =
      selectedCourt.basePrice +
      equipmentTotal +
      (selectedCoach ? selectedCoach.pricePerHour * durationHours : 0);

    setPrice(totalPrice);
  }, [selectedEquipment, selectedCoach, selectedSlot, selectedCourt]);

  /* ---------------- CONFIRMATION ---------------- */

  const [confirmationDialogOpen, setConfirmationDialogOpen] = React.useState(false);

  const [dbUser, setDbUser] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setDbUser(data))
      .catch((err) => console.error("Failed to fetch Prisma user:", err));
  }, []);

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
      equipment: selectedEquipment.map((e) => ({ equipmentId: e.id, quantity: 1 })),
      coachId: selectedCoach?.id ?? null,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!res.ok) throw new Error("Booking failed");

      alert("🎉 Booking Confirmed!");
      // Reset all selections
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


  /* ---------------- UI ---------------- */

  return (
    <>
      <Calendar mode="single" className="mx-auto border rounded-md" selected={date} onSelect={handleDateSelect} />

      {/* COURTS */}
      <Dialog open={courtDialogOpen} onOpenChange={setCourtDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Court</DialogTitle>
            <DialogDescription>
              Choose an available court and view its base price before proceeding.
            </DialogDescription>
          </DialogHeader>

          {courts.map((court) => (
            <div
              key={court.id}
              onClick={() => handleCourtSelect(court)}
              className="cursor-pointer border p-3 rounded-md flex justify-between hover:bg-muted"
            >
              <div>
                <p>{court.name}</p>
                <p className="text-sm text-muted-foreground">
                  ₹{court.basePrice}
                </p>
              </div>
              <Badge>Available</Badge>
            </div>
          ))}
        </DialogContent>
      </Dialog>


      {/* TIME SLOTS */}
      <Dialog open={timeDialogOpen} onOpenChange={setTimeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Time Slot</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => (
              <Button
                key={slot.start}
                disabled={blockedSlots.includes(slot.start)}
                variant={
                  selectedSlot?.start === slot.start ? "default" : "outline"
                }
                onClick={() => setSelectedSlot(slot)}
              >
                {slot.start} - {slot.end}
              </Button>
            ))}
          </div>

          <Button
            className="mt-4 w-full"
            disabled={!selectedSlot}
            onClick={proceedToEquipment}
          >
            Continue →
          </Button>
        </DialogContent>
      </Dialog>

      {/* EQUIPMENT */}
      <Dialog open={equipmentDialogOpen} onOpenChange={setEquipmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Equipment</DialogTitle>
          </DialogHeader>

          {equipment.map((e) => (
            <Button
              key={e.id}
              variant={selectedEquipment.some((x) => x.id === e.id) ? "default" : "outline"}
              onClick={() =>
                setSelectedEquipment((prev) =>
                  prev.some((x) => x.id === e.id)
                    ? prev.filter((x) => x.id !== e.id) // deselect if already selected
                    : [...prev, e] // select if not selected
                )
              }
            >
              {e.name} ₹{e.price}
            </Button>
          ))}

          <Button className="mt-4 w-full" onClick={proceedToCoach}>
            Continue →
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={coachDialogOpen} onOpenChange={setCoachDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Coach (optional)</DialogTitle>
          </DialogHeader>

          {coaches.length > 0 ? (
            <>
              {coaches.map((c) => (
                <Button
                  key={c.id}
                  variant={selectedCoach?.id === c.id ? "default" : "outline"}
                  onClick={() =>
                    setSelectedCoach((prev) => (prev?.id === c.id ? null : c)) // toggle select/deselect
                  }
                >
                  {c.name} ₹{c.pricePerHour}/hr
                </Button>
              ))}

              {price !== null && (
                <p className="mt-4 font-semibold">Total: ₹{price}</p>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 mt-4">
              No coaches available for the selected time (optional)
            </p>
          )}

          {/* Next button always enabled */}
          <Button className="mt-4" onClick={handleNextStep}>
            Next
          </Button>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <p><strong>Court:</strong> {selectedCourt?.name}</p>
            <p><strong>Date:</strong> {date?.toISOString().split("T")[0]}</p>
            <p><strong>Time:</strong> {selectedSlot?.start} - {selectedSlot?.end}</p>
            {selectedEquipment.length > 0 && (
              <p>
                <strong>Equipment:</strong>{" "}
                {selectedEquipment.map((e) => e.name).join(", ")}
              </p>
            )}
            {selectedCoach && (
              <p><strong>Coach:</strong> {selectedCoach.name}</p>
            )}
            {price !== null && <p><strong>Total Price:</strong> ₹{price}</p>}
          </div>

          <Button className="mt-4 w-full" onClick={confirmBooking}>
            Confirm Booking
          </Button>
        </DialogContent>
      </Dialog>



    </>
  );
}