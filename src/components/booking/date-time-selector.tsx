"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock } from "lucide-react"

interface DateTimeSelectorProps {
  onSelect: (date: string, startTime: string, endTime: string) => void
  selectedDate: string
  selectedStartTime: string
  selectedEndTime: string
  disabled?: boolean
}

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
]

export function DateTimeSelector({
  onSelect,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  disabled,
}: DateTimeSelectorProps) {
  const [date, setDate] = useState(selectedDate)
  const [startTime, setStartTime] = useState(selectedStartTime)
  const [endTime, setEndTime] = useState(selectedEndTime)

  const today = new Date().toISOString().split("T")[0]
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  function handleContinue() {
    if (date && startTime && endTime) {
      onSelect(date, startTime, endTime)
    }
  }

  const isValid = date && startTime && endTime && startTime < endTime

  return (
    <Card className={disabled ? "opacity-60" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Select Date & Time
        </CardTitle>
        <CardDescription>Choose when you want to play</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            min={today}
            max={maxDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time</Label>
            <Select value={startTime} onValueChange={setStartTime} disabled={disabled}>
              <SelectTrigger id="start-time">
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-time">End Time</Label>
            <Select value={endTime} onValueChange={setEndTime} disabled={disabled}>
              <SelectTrigger id="end-time">
                <SelectValue placeholder="Select end time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.filter((time) => !startTime || time > startTime).map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!disabled && (
          <Button onClick={handleContinue} disabled={!isValid} className="w-full">
            <Clock className="mr-2 h-4 w-4" />
            Continue to Court Selection
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
