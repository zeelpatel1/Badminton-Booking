"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slot } from "./types";

interface TimeSlotDialogProps {
  slots: Slot[];
  blockedSlots: string[];
  selectedSlot: Slot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSlot: (slot: Slot) => void;
  onContinue: () => void;
}

export function TimeSlotDialog({ slots, blockedSlots, selectedSlot, open, onOpenChange, onSelectSlot, onContinue }: TimeSlotDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Time Slot</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <Button
              key={slot.start}
              disabled={blockedSlots.includes(slot.start)}
              variant={selectedSlot?.start === slot.start ? "default" : "outline"}
              onClick={() => onSelectSlot(slot)}
            >
              {slot.start} - {slot.end}
            </Button>
          ))}
        </div>

        <Button className="mt-4 w-full" disabled={!selectedSlot} onClick={onContinue}>
          Continue →
        </Button>
      </DialogContent>
    </Dialog>
  );
}
