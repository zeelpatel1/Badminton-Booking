"use client";

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

export default function Overview() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}

      {/* Main content container (matches header width) */}
      <main className="mx-auto max-w-4xl px-4 mt-6">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your courts today.
          </p>
        </div>

        {/* Card for Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  Latest bookings from your customers
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <BookingsTable limit={5} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
