export interface TimeSlot {
    time:string,
    available: boolean;
}

export interface DaySchedule {
  date: string;
  dayLabel: string;
  slots: TimeSlot[];
}

export interface Coach {
  // id: string;
  name: string;
  title: string;
  location: string;
  rating: number;
  reviewCount: number;
  pricePerSession?: number;
  imageUrl: string;
}
