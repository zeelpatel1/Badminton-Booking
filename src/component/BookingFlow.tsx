"use client";

import React from "react";
import { CalendarDemo } from "./Calendar";

type BookingFlowProps = {
  userId: number | undefined;
};

const BookingFlow: React.FC<BookingFlowProps> = ({ userId }) => {
  return (
    <div>
      <CalendarDemo userId={userId} />
    </div>
  );
};

export default BookingFlow;
