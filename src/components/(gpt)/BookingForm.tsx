"use client";

import { useState, useEffect } from "react";
import axios from "axios";

type Court = { id: number; name: string; type: string; basePrice: number };
type Equipment = { id: number; name: string; availableQty: number; price: number };
type Coach = { id: number; name: string; pricePerHour: number };

export default function BookingForm() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [courts, setCourts] = useState<Court[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);

  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<{ equipmentId: number; quantity: number }[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null);

  const [price, setPrice] = useState<{ totalPrice: number; breakdown: Record<string, number> }>({ totalPrice: 0, breakdown: {} });

  // 1️⃣ Fetch availability
  useEffect(() => {
    if (!date || !startTime || !endTime) return;

    axios
      .get("/api/availability", { params: { date, startTime, endTime } })
      .then((res) => {
        setCourts(res.data.courts);
        setEquipment(res.data.equipment);
        setCoaches(res.data.coaches);
      });
  }, [date, startTime, endTime]);

  // 2️⃣ Fetch pricing preview
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

  // 3️⃣ Handle Booking
  const handleBooking = async () => {
    try {
      const res = await axios.post("/api/bookings", {
        userId: 1, // Replace with logged in user ID
        courtId: selectedCourt,
        equipment: selectedEquipment,
        coachId: selectedCoach,
        date,
        startTime,
        endTime,
      });
      alert("Booking Confirmed! Total: " + res.data.totalPrice);
    } catch (err: any) {
      alert("Booking failed: " + err.response?.data?.error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Book a Court</h1>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />

      <select onChange={(e) => setSelectedCourt(Number(e.target.value))} value={selectedCourt ?? ""}>
        <option value="">Select Court</option>
        {courts.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.type})
          </option>
        ))}
      </select>

      <div>
        <h2>Equipment</h2>
        {equipment.map((eq) => (
          <div key={eq.id}>
            <label>
              {eq.name} ({eq.availableQty} available):
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
              />
            </label>
          </div>
        ))}
      </div>

      <div>
        <h2>Coach</h2>
        <select onChange={(e) => setSelectedCoach(Number(e.target.value))} value={selectedCoach ?? ""}>
          <option value="">No Coach</option>
          {coaches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (${c.pricePerHour}/hr)
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2>Price Breakdown</h2>
        {Object.entries(price.breakdown).map(([key, value]) => (
          <div key={key}>
            {key}: ${value}
          </div>
        ))}
        <strong>Total: ${price.totalPrice}</strong>
      </div>

      <button onClick={handleBooking} className="bg-blue-500 text-white px-4 py-2 rounded">
        Confirm Booking
      </button>
    </div>
  );
}
