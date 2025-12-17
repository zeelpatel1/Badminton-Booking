"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Users } from "lucide-react"
import type { Coach } from "@/lib/db/schema"

interface CoachSelectorProps {
  date: string
  startTime: string
  endTime: string
  selectedCoachId?: string
  onSelectionChange: (coachId: string | undefined) => void
}

export function CoachSelector({ date, startTime, endTime, selectedCoachId, onSelectionChange }: CoachSelectorProps) {
  const [coaches, setCoaches] = useState<Coach[]>([])

  useEffect(() => {
    async function fetchCoaches() {
      const res = await fetch("/api/admin/coaches")
      const data = await res.json()
      setCoaches(data.coaches || [])
    }

    fetchCoaches()
  }, [])

  function handleSelect(coachId: string) {
    if (selectedCoachId === coachId) {
      onSelectionChange(undefined)
    } else {
      onSelectionChange(coachId)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Add Coach (Optional)
        </CardTitle>
        <CardDescription>Book a professional coach for your session</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {coaches.map((coach) => (
            <Button
              key={coach.id}
              variant={selectedCoachId === coach.id ? "default" : "outline"}
              className="h-auto w-full justify-start p-3"
              onClick={() => handleSelect(coach.id)}
            >
              <div className="flex w-full items-start justify-between">
                <div className="text-left">
                  <div className="font-semibold">{coach.name}</div>
                  <div className="text-xs text-muted-foreground">{coach.specialty}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">${coach.pricePerHour}/hr</span>
                  {selectedCoachId === coach.id && <CheckCircle2 className="h-4 w-4" />}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
