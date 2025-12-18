"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

interface Booking {
  id: string;
  user: string;
  court: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
  amount: string;
}

interface BookingsTableProps {
  limit?: number;
}

export function BookingsTable({ limit }: BookingsTableProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("/api/bookings"); // Your backend endpoint
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        // Transform backend data if necessary
        const transformed = data.map((b: any) => ({
          id: b.id,
          user: b.user.name || "Unknown User",
          court: b.courtReservation?.court.name || "Court N/A",
          date: new Date(b.startTime).toLocaleDateString(),
          time: `${new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          status: b.status,
          amount: `$${b.totalPrice.toFixed(2)}`,
        }));
        setBookings(transformed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  if (loading) return <div>Loading bookings...</div>;

  const displayBookings = limit ? bookings.slice(0, limit) : bookings;

  return (
    <div className="space-y-4">
      {displayBookings.map((booking) => (
        <div
          key={booking.id}
          className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-medium">
              {booking.user
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{booking.user}</span>
                <span className="text-xs text-muted-foreground">#{booking.id}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  <span>{booking.court}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>{booking.time}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge
              variant={
                booking.status === "confirmed"
                  ? "default"
                  : booking.status === "pending"
                  ? "secondary"
                  : "destructive"
              }
            >
              {booking.status}
            </Badge>
            <div className="text-right">
              <div className="font-semibold">{booking.amount}</div>
              <div className="text-xs text-muted-foreground">{booking.date}</div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
