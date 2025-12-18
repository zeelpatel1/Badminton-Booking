"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Settings, CheckCircle2, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

const courts = [
  {
    id: 1,
    name: "Court 1",
    status: "available",
    type: "Premium",
    bookings: 8,
    revenue: "$360",
    capacity: 4,
  },
  {
    id: 2,
    name: "Court 2",
    status: "occupied",
    type: "Standard",
    bookings: 12,
    revenue: "$540",
    capacity: 4,
  },
  {
    id: 3,
    name: "Court 3",
    status: "available",
    type: "Premium",
    bookings: 6,
    revenue: "$270",
    capacity: 4,
  },
  {
    id: 4,
    name: "Court 4",
    status: "maintenance",
    type: "Standard",
    bookings: 4,
    revenue: "$180",
    capacity: 4,
  },
]

type Court = {
  id: number;
  name: string;
  status: "available" | "occupied" | "maintenance";
  type: string;
  bookings: number;
  revenue: string;
  basePrice:number;
};

export function CourtsGrid({ courts }: { courts: Court[] }) {

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courts.map((court) => (
        <Card key={court.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{court.name}</CardTitle>
              {/* <Badge
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${court.status === "available"
                    ? "bg-green-100 text-green-800"
                    : court.status === "occupied"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
              >
                {court.status === "available" && <CheckCircle2 className="size-3" />}
                {court.status === "maintenance" && <AlertCircle className="size-3" />}
                {court.status}
              </Badge> */}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{court.type}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Today's Bookings</span>
              <span className="font-medium">{court.bookings}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Base Price</span>
              <span className="font-semibold ">{court.basePrice}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-semibold text-accent">{court.revenue}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <MapPin className="mr-1 size-3" />
                View
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <Settings className="mr-1 size-3" />
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
