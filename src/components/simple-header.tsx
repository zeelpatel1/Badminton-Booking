"use client"

import React from "react"
import Image from "next/image"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs"

import { Sheet, SheetContent, SheetFooter } from "@/components/sheet"
import { Button, buttonVariants } from "@/components/ui/button"
import { MenuToggle } from "@/components/menu-toggle"

export function SimpleHeader() {
  const [open, setOpen] = React.useState(false)

  const links = [
    { label: "WaitList", href: "#" },
    { label: "My Booking", href: "#" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/Shuttle.png"
            height={40}
            width={40}
            className="rounded-full"
            alt="logo"
          />
          <p className="font-mono text-lg font-bold">Shuttle Time</p>
        </div>

        {/* Desktop */}
        <div className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
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
                  className={buttonVariants({
                    variant: "ghost",
                    className: "justify-start",
                  })}
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
    </header>
  )
}
