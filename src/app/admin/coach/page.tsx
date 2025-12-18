"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Coach {
  id: number;
  name: string;
  pricePerHour: number;
  enabled: boolean;
}

export default function AdminPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null);
  const [coachName, setCoachName] = useState(""); // New coach name
  const [pricePerHour, setPricePerHour] = useState<number>(0); // New coach price
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Fetch all coaches
  const fetchCoaches = async () => {
    try {
      const res = await fetch("/api/admin/coaches");
      const data = await res.json();
      setCoaches(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  // Add a new coach
  const handleAddCoach = async () => {
    if (!coachName || !pricePerHour) {
      toast.error("Enter coach name and price");
      return;
    }

    const res = await fetch("/api/admin/coaches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: coachName, pricePerHour }),
    });

    if (res.ok) {
      toast.success("Coach added successfully");
      setCoachName("");
      setPricePerHour(0);
      fetchCoaches(); // refresh list
    } else {
      const data = await res.json();
      toast.error(data?.error || "Failed to add coach");
    }
  };

  // Add availability for selected coach
  const handleAddAvailability = async () => {
    if (!selectedCoach || !date || !startTime || !endTime) {
      toast.error("Fill all availability fields");
      return;
    }

    const res = await fetch(`/api/admin/coaches/${selectedCoach}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, startTime, endTime }),
    });

    if (res.ok) {
      toast.success("Availability added");
      setDate("");
      setStartTime("");
      setEndTime("");
    } else {
      const data = await res.json();
      toast.error(data?.error || "Failed to add availability");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Add new coach */}
      <div className="border p-4 rounded space-y-2">
        <h2 className="font-semibold">Add New Coach</h2>

        <input
          type="text"
          placeholder="Coach Name"
          className="w-full border rounded p-2"
          value={coachName}
          onChange={(e) => setCoachName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price per Hour"
          className="w-full border rounded p-2"
          value={pricePerHour}
          onChange={(e) => setPricePerHour(Number(e.target.value))}
        />

        <button
          onClick={handleAddCoach}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add Coach
        </button>
      </div>

      {/* Add availability */}
      <div className="border p-4 rounded space-y-2">
        <h2 className="font-semibold">Add Coach Availability</h2>

        <select
          className="w-full border rounded p-2"
          value={selectedCoach ?? ""}
          onChange={(e) => setSelectedCoach(Number(e.target.value))}
        >
          <option value="">-- Select Coach --</option>
          {coaches.map((coach) => (
            <option key={coach.id} value={coach.id}>
              {coach.name} - ₹{coach.pricePerHour}/hr
            </option>
          ))}
        </select>

        <input
          type="date"
          className="w-full border rounded p-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          className="w-full border rounded p-2"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <input
          type="time"
          className="w-full border rounded p-2"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <button
          onClick={handleAddAvailability}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Add Availability
        </button>
      </div>
    </div>
  );
}
