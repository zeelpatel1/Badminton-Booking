import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react"; // make sure it's from lucide-react
import { BookingsTable } from "@/components/booking-table";

export default function Booking() {
  return (
    <div className="space-y-6 mx-auto max-w-4xl px-4 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage all court bookings</p>
        </div>

        <Button className="flex items-center gap-2">
          <Calendar size={16} /> {/* use size prop for lucide icon */}
          New Booking
        </Button>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="pt-6">
          <BookingsTable />
        </CardContent>
      </Card>
    </div>
  );
}
