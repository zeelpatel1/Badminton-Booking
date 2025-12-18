import prisma from "@/lib/prisma";

export async function getAvailableCourts(date: string, startTime: string, endTime: string) {
  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(`${date}T${endTime}:00`);

  // 1️⃣ Get all enabled courts
  const allCourts = await prisma.court.findMany({
    where: { enabled: true },
  });

  // 2️⃣ Get courts that have bookings overlapping with the slot
  const bookedCourts = await prisma.courtReservation.findMany({
    where: {
      booking: {
        AND: [
          { date: start }, // booking on the same day
          { startTime: { lt: end } },
          { endTime: { gt: start } },
          { status: "CONFIRMED" },
        ],
      },
    },
    select: { courtId: true },
  });

  const bookedCourtIds = bookedCourts.map((b) => b.courtId);

  // 3️⃣ Filter out booked courts
  const availableCourts = allCourts.filter((c) => !bookedCourtIds.includes(c.id));

  return availableCourts;
}


export async function getAvailableEquipment(start:Date,end:Date){
    const equipment=await prisma.equipment.findMany({
        where:{
            enabled:true
        },
        select:{
            id:true,
            name:true,
            totalQty:true,
            price: true,
            reservations:{
                where:{
                    booking:{
                        startTime:{lt:end},
                        endTime:{gt:start},
                        status:"CONFIRMED"
                    }
                },
                select:{quantity:true}
            }
        }
    })
    return equipment.map((item)=>{
        const reservedQty=item.reservations.reduce(
            (sum,r) => sum + r.quantity,
            0
        )
        const availableQty=item.totalQty-reservedQty
        if(availableQty<=0) return null

        return {
            id:item.id,
            name:item.name,
            availableQty,
            price:item.price
        }
    }).filter(Boolean)
}

export async function getAvailableCoaches(start: Date, end: Date) {
    return prisma.coach.findMany({
      where: {
        enabled: true,
        availabilities: {
          some: {
            startTime: { lte: start },
            endTime: { gte: end },
            isBooked: false,
          },
        },
      },
      select: {
        id: true,
        name: true,
        pricePerHour: true,
      },
    })
  }