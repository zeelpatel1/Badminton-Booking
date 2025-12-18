"use client"

import React, { useState } from "react"
import Image from "next/image"
import { SignedIn, SignedOut, SignInButton, useUser, UserButton } from "@clerk/nextjs"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetFooter } from "@/components/sheet"
import { MenuToggle } from "@/components/menu-toggle"
import { MyBookingDialog } from "./booking/MyBookingsDialog" // import the dialog

type Booking = {
  id: number
  courtReservation: { court: { name: string } }
  date: string
  startTime: string
  endTime: string
  totalPrice: number
}

export function SimpleHeader() {
  const [open, setOpen] = useState(false)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useUser()

  const links = [
    { label: "WaitList", href: "#" },
    {
      label: "My Booking",
      href: "#",
      onClick: async () => {
        if (!user) {
          alert("Please login to view your bookings")
          return
        }

        try {
          setLoading(true)
          const res = await fetch(`/api/bookings?clerkId=${user.id}`)
          const result = await res.json()
          if (result.success) {
            setBookings(result.data)
            setBookingDialogOpen(true)
          } else {
            alert("Failed to fetch bookings: " + result.error)
          }
        } catch (err) {
          console.error(err)
          alert("Failed to fetch bookings")
        } finally {
          setLoading(false)
        }
      },
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image src="/Shuttle.png" height={40} width={40} className="rounded-full" alt="logo" />
          <p className="font-mono text-lg font-bold">Shuttle Time</p>
        </div>

        {/* Desktop */}
        <div className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault()
                link.onClick?.()
              }}
              className={buttonVariants({ variant: "ghost" })}
            >
              {link.label}
            </a>
          ))}

          <SignedOut>
            <SignInButton>
              <Button>Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <Button size="icon" variant="outline" className="lg:hidden">
            <MenuToggle open={open} onOpenChange={setOpen} />
          </Button>

          <SheetContent side="left" showClose={false}>
            <div className="grid gap-y-2 px-4 pt-12">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    link.onClick?.()
                  }}
                  className={buttonVariants({ variant: "ghost", className: "justify-start" })}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <SheetFooter>
              <SignedOut>
                <SignInButton>
                  <Button className="w-full">Login</Button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </nav>

      {/* ---------------- Bookings Dialog ---------------- */}
      <MyBookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        bookings={bookings}
        loading={loading}
      />
    </header>
  )
}
