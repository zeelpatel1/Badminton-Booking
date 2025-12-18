"use client";

import React, { useEffect, useState } from "react";
import BookingFlow from "@/component/BookingFlow";
import { useUser, SignInButton } from "@clerk/nextjs";

const Page = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/sync-user", { method: "POST" })
        .then(res => res.json())
        .then(data => setDbUser(data))
        .catch(err => console.error("Error syncing user:", err));
    }
  }, [isSignedIn]);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="mt-10 text-center">
        <h2 className="text-2xl font-bold">Please login first to access booking</h2>
        <p className="mt-2">
          <SignInButton>
            <button className="px-4 py-2 mt-4 bg-blue-600 text-white rounded">
              Login
            </button>
          </SignInButton>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 mt-10 text-center">
        <h2 className="text-4xl font-mono font-bold tracking-tight">Book Your Court</h2>
        <p className="mt-2 font-mono text-lg text-muted-foreground">
          Welcome, {dbUser?.name || user?.firstName} 
        </p>
        <p className="mt-2 font-mono text-lg text-muted-foreground">
          Choose from 4 badminton courts, add equipment, and book a coach
        </p>
      </div>
      {/* Pass userId to BookingFlow */}
      <BookingFlow userId={dbUser?.id} />
    </div>
  );
};

export default Page;
