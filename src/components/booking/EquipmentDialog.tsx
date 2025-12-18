"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Equipment } from "./types";

interface EquipmentDialogProps {
  equipment: Equipment[];
  selectedEquipment: Equipment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleEquipment: (e: Equipment) => void;
  onContinue: () => void;
}

export function EquipmentDialog({ equipment, selectedEquipment, open, onOpenChange, onToggleEquipment, onContinue }: EquipmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Equipment</DialogTitle>
        </DialogHeader>

        {equipment.map((e) => (
          <Button
            key={e.id}
            variant={selectedEquipment.some((x) => x.id === e.id) ? "default" : "outline"}
            onClick={() => onToggleEquipment(e)}
          >
            {e.name} ₹{e.price}
          </Button>
        ))}

        <Button className="mt-4 w-full" onClick={onContinue}>
          Continue →
        </Button>
      </DialogContent>
    </Dialog>
  );
}
