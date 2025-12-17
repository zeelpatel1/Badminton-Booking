import { Coach } from "./types";

export const defaultCoach:Coach={
    name:"Michael Baumgardner",
    title:"Beginner Intermediate",
    location:"Indoor I",
    rating:5.0,
    reviewCount:7,
    imageUrl: "https://images.unsplash.com/photo-1660463532854-f887f2a6c674"
}

export const Location=[
    "Indoor I",
    "Indoor II",
    "Outdoor I",
    "Outdoor II"
]

import { DaySchedule } from "./types";

export const sampleWeekSchedule: DaySchedule[] = [
  {
    date: "2025-08-17",
    dayLabel: "Today",
    slots: [
      { time: "10:00 AM", available: true },
      { time: "10:30 AM", available: true },
      { time: "11:00 AM", available: true },
      { time: "11:30 AM", available: false },
      { time: "12:00 PM", available: true },
      { time: "12:30 PM", available: true },
    ],
  },
  {
    date: "2025-08-18",
    dayLabel: "Mon",
    slots: [
      { time: "09:00 AM", available: true },
      { time: "09:30 AM", available: false },
      { time: "10:00 AM", available: false },
      { time: "10:30 AM", available: true },
    ],
  },
  {
    date: "2025-08-19",
    dayLabel: "Tue",
    slots: [
      { time: "01:00 PM", available: false },
      { time: "01:30 PM", available: false },
      { time: "02:00 PM", available: false },
    ],
  },
  {
    date: "2025-08-20",
    dayLabel: "Wed",
    slots: [], // No availability
  },
];
