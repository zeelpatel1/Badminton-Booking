"use client";

import { useState, useEffect } from "react";
import axios from "axios";

type Court = { id: number; name: string; type: string; basePrice: number };
type Equipment = { id: number; name: string; availableQty: number; price: number };
type Coach = { id: number; name: string; pricePerHour: number };

export default function BookingPage() {
  // Date & Time
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Available resources
  const [courts, setCourts] = useState<Court[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);

  // Selected resources
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<{ equipmentId: number; quantity: number }[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null);

  // Pricing
  const [price, setPrice] = useState<{ totalPrice: number; breakdown: Record<string, number> }>({ totalPrice: 0, breakdown: {} });

  // 1️⃣ Fetch availability whenever date/time changes
  useEffect(() => {
    if (!date || !startTime || !endTime) return;

    axios
      .get("/api/availability", { params: { date, startTime, endTime } })
      .then((res) => {
        setCourts(res.data.courts);
        setEquipment(res.data.equipment);
        setCoaches(res.data.coaches);

        // Reset selections if no longer available
        if (!res.data.courts.find((c: Court) => c.id === selectedCourt)) setSelectedCourt(null);
        if (!res.data.coaches.find((c: Coach) => c.id === selectedCoach)) setSelectedCoach(null);
      });
  }, [date, startTime, endTime]);

  // 2️⃣ Fetch live pricing preview whenever selection changes
  useEffect(() => {
    if (!selectedCourt) return;

    axios
      .post("/api/pricing/preview", {
        courtId: selectedCourt,
        equipment: selectedEquipment,
        coachId: selectedCoach,
        date,
        startTime,
        endTime,
      })
      .then((res) => setPrice(res.data));
  }, [selectedCourt, selectedEquipment, selectedCoach, date, startTime, endTime]);

  // 3️⃣ Handle booking
  const handleBooking = async () => {
    try {
      if (!selectedCourt) {
        alert("Please select a court");
        return;
      }

      const res = await axios.post("/api/bookings", {
        userId: 1, // Replace with logged-in user ID
        courtId: selectedCourt,
        equipment: selectedEquipment,
        coachId: selectedCoach,
        date,
        startTime,
        endTime,
      });

      alert("Booking confirmed! Total: $" + res.data.totalPrice);
    } catch (err: any) {
      alert("Booking failed: " + err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Book a Court</h1>

      {/* Date & Time */}
      <div className="flex gap-4">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 rounded" />
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border p-2 rounded" />
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border p-2 rounded" />
      </div>

      {/* Select Court */}
      <div>
        <h2 className="font-semibold">Available Courts</h2>
        <div className="flex gap-4 flex-wrap mt-2">
          {courts.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCourt(c.id)}
              className={`px-4 py-2 rounded border ${
                selectedCourt === c.id ? "bg-blue-500 text-white" : "bg-white text-black"
              }`}
            >
              {c.name} ({c.type}) - ${c.basePrice}
            </button>
          ))}
        </div>
      </div>

      {/* Select Equipment */}
      <div>
        <h2 className="font-semibold mt-4">Equipment</h2>
        {equipment.map((eq) => (
          <div key={eq.id} className="flex items-center gap-2 mt-1">
            <span>{eq.name} ({eq.availableQty} available)</span>
            <input
              type="number"
              min={0}
              max={eq.availableQty}
              value={selectedEquipment.find((e) => e.equipmentId === eq.id)?.quantity || 0}
              onChange={(e) => {
                const qty = Number(e.target.value);
                setSelectedEquipment((prev) => {
                  const filtered = prev.filter((x) => x.equipmentId !== eq.id);
                  if (qty > 0) filtered.push({ equipmentId: eq.id, quantity: qty });
                  return filtered;
                });
              }}
              className="border p-1 rounded w-16"
            />
          </div>
        ))}
      </div>

      {/* Select Coach */}
      <div>
        <h2 className="font-semibold mt-4">Coach</h2>
        <select
          value={selectedCoach ?? ""}
          onChange={(e) => setSelectedCoach(Number(e.target.value))}
          className="border p-2 rounded mt-1"
        >
          <option value="">No Coach</option>
          {coaches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (${c.pricePerHour}/hr)
            </option>
          ))}
        </select>
      </div>

      {/* Price Breakdown */}
      <div className="mt-4 p-4 border rounded bg-gray-50">
        <h2 className="font-semibold">Price Breakdown</h2>
        {Object.entries(price.breakdown).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span>{key}</span>
            <span>${value}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold mt-2">
          <span>Total</span>
          <span>${price.totalPrice}</span>
        </div>
      </div>

      {/* Booking Button */}
      <button
        onClick={handleBooking}
        className="w-full mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
      >
        Confirm Booking
      </button>
    </div>
  );
}
