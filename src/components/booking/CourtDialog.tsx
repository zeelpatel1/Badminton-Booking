"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Court } from "./types";

interface CourtDialogProps {
  courts: Court[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCourt: (court: Court) => void;
}

export function CourtDialog({ courts, open, onOpenChange, onSelectCourt }: CourtDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Court</DialogTitle>
          <DialogDescription>Choose an available court and view its base price before proceeding.</DialogDescription>
        </DialogHeader>

        {courts.map((court) => (
          <div
            key={court.id}
            onClick={() => onSelectCourt(court)}
            className="cursor-pointer border p-3 rounded-md flex justify-between hover:bg-muted"
          >
            <div>
              <p>{court.name}</p>
              <p className="text-sm text-muted-foreground">₹{court.basePrice}</p>
            </div>
            <Badge>Available</Badge>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}
