"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, ArrowLeft, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BookingConfirmationProps {
  bookingData: {
    courtId: string
    date: string
    startTime: string
    endTime: string
    userId: string
    userName: string
    userEmail: string
    equipmentIds: string[]
    coachId?: string
  }
  onReset: () => void
}

export function BookingConfirmation({ bookingData, onReset }: BookingConfirmationProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [waitlisted, setWaitlisted] = useState(false)
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [canJoinWaitlist, setCanJoinWaitlist] = useState(false)
  const { toast } = useToast()

  async function handleConfirmBooking() {
    setLoading(true)
    setError(null)
    setCanJoinWaitlist(false)

    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        toast({
          title: "Booking Confirmed!",
          description: "Your court has been successfully booked.",
        })
      } else {
        if (data.canWaitlist) {
          setCanJoinWaitlist(true)
          setError("This slot is now fully booked. Would you like to join the waitlist?")
        } else {
          setError(data.error || "Failed to create booking")
        }
        toast({
          title: "Booking Failed",
          description: data.error || "Failed to create booking",
          variant: "destructive",
        })
      }
    } catch (err) {
      setError("Network error. Please try again.")
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  async function handleJoinWaitlist() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })

      const data = await res.json()

      if (res.ok) {
        setWaitlisted(true)
        setWaitlistPosition(data.position)
        setCanJoinWaitlist(false)
        toast({
          title: "Joined Waitlist!",
          description: `You are position #${data.position}. We'll notify you if a spot opens up.`,
        })
      } else {
        setError(data.error || "Failed to join waitlist")
        toast({
          title: "Waitlist Failed",
          description: data.error || "Failed to join waitlist",
          variant: "destructive",
        })
      }
    } catch (err) {
      setError("Network error. Please try again.")
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  if (waitlisted) {
    return (
      <Card className="mx-auto max-w-2xl border-blue-200 bg-blue-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Clock className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Joined Waitlist!</CardTitle>
          <CardDescription>You are position #{waitlistPosition} in the queue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-white p-4 space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              We'll notify you immediately at <strong>{bookingData.userEmail}</strong> if a spot opens up for this time
              slot.
            </p>
            <div className="flex items-center justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{bookingData.date}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">
                {bookingData.startTime} - {bookingData.endTime}
              </span>
            </div>
          </div>

          <Button onClick={onReset} className="w-full" size="lg">
            Make Another Booking
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="mx-auto max-w-2xl border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
          <CardDescription>Your court has been successfully reserved</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-white p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{bookingData.date}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">
                {bookingData.startTime} - {bookingData.endTime}
              </span>
            </div>
          </div>

          <Button onClick={onReset} className="w-full" size="lg">
            Make Another Booking
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Confirm Your Booking</CardTitle>
        <CardDescription>Review your booking details before confirming</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Date</span>
            <span className="font-medium">{bookingData.date}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Time</span>
            <span className="font-medium">
              {bookingData.startTime} - {bookingData.endTime}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Court</span>
            <span className="font-medium">{bookingData.courtId}</span>
          </div>
          {bookingData.equipmentIds.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Equipment</span>
              <span className="font-medium">{bookingData.equipmentIds.length} items</span>
            </div>
          )}
          {bookingData.coachId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Coach</span>
              <span className="font-medium">Yes</span>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={onReset} variant="outline" className="flex-1 bg-transparent" disabled={loading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {canJoinWaitlist ? (
            <Button onClick={handleJoinWaitlist} className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Joining..." : "Join Waitlist"}
            </Button>
          ) : (
            <Button onClick={handleConfirmBooking} className="flex-1" disabled={loading}>
              {loading ? "Processing..." : "Confirm Booking"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
