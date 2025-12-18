"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Court, Slot, Equipment, Coach } from "./types";
import React from "react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  court: Court | null;
  slot: Slot | null;
  date?: Date;
  equipment: Equipment[];
  coach?: Coach | null;
  price: number | null;
  userId: string; // Pass the current logged-in user ID
  onSuccess?: () => void; // Optional callback after successful booking
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  court,
  slot,
  date,
  equipment,
  coach,
  price,
  userId,
  onSuccess,
}: ConfirmationDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (!court || !slot || !date) return;

    setLoading(true);

    const bookingData = {
      userId,
      courtId: court.id,
      date: date.toISOString().split("T")[0],
      startTime: slot.start,
      endTime: slot.end,
      equipment: equipment.map((e) => ({ equipmentId: e.id, quantity: 1 })),
      coachId: coach?.id ?? null,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!res.ok) throw new Error("Booking failed");

      alert("🎉 Booking Confirmed!");
      onOpenChange(false);

      // Call optional parent callback
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p><strong>Court:</strong> {court?.name}</p>
          <p><strong>Date:</strong> {date?.toISOString().split("T")[0]}</p>
          <p><strong>Time:</strong> {slot?.start} - {slot?.end}</p>
          {equipment.length > 0 && <p><strong>Equipment:</strong> {equipment.map(e => e.name).join(", ")}</p>}
          {coach && <p><strong>Coach:</strong> {coach.name}</p>}
          {price !== null && <p><strong>Total Price:</strong> ₹{price}</p>}
        </div>

        <Button className="mt-4 w-full" onClick={handleConfirm} disabled={loading}>
          {loading ? "Booking..." : "Confirm Booking"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
