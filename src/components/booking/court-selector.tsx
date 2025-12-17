"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, MapPin } from "lucide-react"
import type { Court } from "@/lib/db/schema"

interface CourtSelectorProps {
  date: string
  startTime: string
  endTime: string
  selectedCourtId: string
  onSelect: (courtId: string) => void
  disabled?: boolean
}

interface CourtWithAvailability extends Court {
  available: boolean
}

export function CourtSelector({ date, startTime, endTime, selectedCourtId, onSelect, disabled }: CourtSelectorProps) {
  const [courts, setCourts] = useState<CourtWithAvailability[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true)
      const res = await fetch(`/api/availability?date=${date}&startTime=${startTime}&endTime=${endTime}`)
      const data = await res.json()
      setCourts(data.courts || [])
      setLoading(false)
    }

    if (date && startTime && endTime) {
      fetchAvailability()
    }
  }, [date, startTime, endTime])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading courts...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={disabled ? "opacity-60" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Court
        </CardTitle>
        <CardDescription>Choose an available court for your booking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {courts.map((court) => (
            <Button
              key={court.id}
              variant={selectedCourtId === court.id ? "default" : "outline"}
              className="h-auto justify-start p-4"
              onClick={() => !disabled && court.available && onSelect(court.id)}
              disabled={disabled || !court.available}
            >
              <div className="flex w-full items-start justify-between">
                <div className="text-left">
                  <div className="font-semibold">{court.name}</div>
                  <div className="text-xs capitalize text-muted-foreground">{court.type}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {court.available ? (
                    <>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Available
                      </Badge>
                      {selectedCourtId === court.id && <CheckCircle2 className="h-4 w-4" />}
                    </>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Booked
                    </Badge>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
