"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

interface CalendarSelectorProps {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
}

export function CalendarSelector({ selectedDate, onSelectDate }: CalendarSelectorProps) {
  return (
    <Calendar
      mode="single"
      className="mx-auto border rounded-md"
      selected={selectedDate}
      onSelect={onSelectDate}
    />
  );
}
