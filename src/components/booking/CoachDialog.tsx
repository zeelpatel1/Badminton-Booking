"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coach } from "./types";

interface CoachDialogProps {
  coaches: Coach[];
  selectedCoach: Coach | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCoach: (c: Coach | null) => void;
  onNext: () => void;
  price: number | null;
}

export function CoachDialog({ coaches, selectedCoach, open, onOpenChange, onSelectCoach, onNext, price }: CoachDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onClick={() => onSelectCoach(selectedCoach?.id === c.id ? null : c)}
              >
                {c.name} ₹{c.pricePerHour}/hr
              </Button>
            ))}
            {price !== null && <p className="mt-4 font-semibold">Total: ₹{price}</p>}
          </>
        ) : (
          <p className="text-center text-gray-500 mt-4">No coaches available for the selected time (optional)</p>
        )}

        <Button className="mt-4" onClick={onNext}>
          Next
        </Button>
      </DialogContent>
    </Dialog>
  );
}
