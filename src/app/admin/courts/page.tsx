"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface Court {
  id: number;
  name: string;
  type: "INDOOR" | "OUTDOOR";
  basePrice: number;
  enabled: boolean;
}

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCourts = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/courts");
    const data = await res.json();
    setCourts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  async function toggleCourt(id: number, enabled: boolean) {
    await fetch("/api/admin/courts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled }),
    });
    fetchCourts();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Courts</CardTitle>
        <CardDescription>Manage courts availability and pricing</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && <p>Loading...</p>}

        {courts.map((court) => (
          <div
            key={court.id}
            className="flex items-center justify-between border p-3 rounded-md"
          >
            <div>
              <p className="font-medium">{court.name}</p>
              <p className="text-sm text-muted-foreground">
                {court.type} • ₹{court.basePrice}
              </p>
            </div>

            <Switch
              checked={court.enabled}
              onCheckedChange={(value) => toggleCourt(court.id, value)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
