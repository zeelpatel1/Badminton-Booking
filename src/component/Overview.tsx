"use client";

import React, { useEffect, useState } from "react";
import { SimpleHeader } from "@/components/simple-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { BookingsTable } from "@/components/booking-table";
import { useUser } from "@clerk/nextjs";

interface Booking {
  id: string;
  user: string;
  court: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
  amount: string;
}

export default function Overview() {
  const { user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false); // track whether to show all bookings

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return;

      try {
        setLoading(true);
        const res = await fetch("/api/bookings/all");
        const result = await res.json();

        if (result.success) {
          const transformed: Booking[] = result.data.map((b: any) => ({
            id: b.id,
            user: b.user?.name || "Unknown User",
            court: b.courtReservation?.court?.name || "Court N/A",
            date: new Date(b.startTime).toLocaleDateString(),
            time: `${new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(b.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
            status: b.status,
            amount: `$${b.totalPrice.toFixed(2)}`,
          }));
          setBookings(transformed);
        } else {
          console.error("Failed to fetch bookings:", result.error);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">

      <main className="mx-auto max-w-4xl px-4 mt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your courts today.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bookings</CardTitle>
                <CardDescription>
                  Latest bookings from your customers
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)} // toggle showAll
              >
                {showAll ? "Show Less" : "View All"}{" "}
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <BookingsTable bookings={showAll ? bookings : bookings.slice(0, 5)} loading={loading} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
