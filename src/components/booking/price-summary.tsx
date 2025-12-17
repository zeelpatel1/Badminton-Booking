"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Receipt, ArrowRight } from "lucide-react"

interface PriceSummaryProps {
  bookingData: {
    date: string
    startTime: string
    endTime: string
    courtId: string
    equipmentIds: string[]
    coachId?: string
  }
  onConfirm: () => void
  canConfirm: boolean
}

interface PriceBreakdown {
  courtPrice: number
  equipmentPrice: number
  coachPrice: number
  appliedRules: { ruleName: string; amount: number }[]
  totalPrice: number
}

export function PriceSummary({ bookingData, onConfirm, canConfirm }: PriceSummaryProps) {
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function calculatePrice() {
      if (!bookingData.courtId || !bookingData.date || !bookingData.startTime || !bookingData.endTime) {
        setPriceBreakdown(null)
        return
      }

      setLoading(true)
      try {
        const res = await fetch("/api/pricing/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        })
        const data = await res.json()
        setPriceBreakdown(data)
      } catch (error) {
        console.error("[v0] Price calculation error:", error)
      }
      setLoading(false)
    }

    calculatePrice()
  }, [bookingData])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Price Summary
        </CardTitle>
        <CardDescription>Live pricing based on your selection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground">Calculating...</div>
        ) : priceBreakdown ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Court</span>
                <span className="font-medium">${priceBreakdown.courtPrice.toFixed(2)}</span>
              </div>

              {priceBreakdown.appliedRules.length > 0 && (
                <div className="ml-4 space-y-1">
                  {priceBreakdown.appliedRules.map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>+ {rule.ruleName}</span>
                      <span>${rule.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {priceBreakdown.equipmentPrice > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Equipment</span>
                  <span className="font-medium">${priceBreakdown.equipmentPrice.toFixed(2)}</span>
                </div>
              )}

              {priceBreakdown.coachPrice > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Coach</span>
                  <span className="font-medium">${priceBreakdown.coachPrice.toFixed(2)}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold">${priceBreakdown.totalPrice.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <div className="text-center text-sm text-muted-foreground">Select a court to see pricing</div>
        )}
      </CardContent>
      {canConfirm && priceBreakdown && (
        <CardFooter>
          <Button onClick={onConfirm} className="w-full" size="lg">
            Confirm Booking
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
