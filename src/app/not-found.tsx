"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <Image
        src="/Shuttle.png"
        alt="Shuttle Time"
        width={64}
        height={64}
        className="mb-6 rounded-full"
      />

      <h1 className="text-4xl font-bold tracking-tight">
        Page not found
      </h1>

      <p className="mt-3 max-w-md text-muted-foreground">
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>

      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>

      </div>
    </div>
  );
}
