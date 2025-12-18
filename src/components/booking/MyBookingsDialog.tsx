"use client"

import React from "react"
import { Sheet, SheetContent, SheetFooter } from "@/components/sheet"
import { Button } from "@/components/ui/button"

type Booking = {
  id: number
  courtReservation: { court: { name: string } }
  date: string
  startTime: string
  endTime: string
  totalPrice: number
}

interface MyBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookings: Booking[]
  loading?: boolean
}

export function MyBookingDialog({
  open,
  onOpenChange,
  bookings,
  loading = false,
}: MyBookingDialogProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <h2 className="text-lg font-bold mb-4">My Bookings</h2>

        {loading ? (
          <p>Loading...</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <ul className="space-y-2">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="border p-3 rounded-md flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{b.courtReservation.court.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.date} | {b.startTime} - {b.endTime}
                  </p>
                </div>
                <p className="font-semibold">₹{b.totalPrice}</p>
              </li>
            ))}
          </ul>
        )}

        <SheetFooter>
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
