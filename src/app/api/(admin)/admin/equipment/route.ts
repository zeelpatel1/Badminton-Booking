import prisma from "@/lib/prisma";
import { NextResponse,NextRequest } from "next/server";

export async function POST(req:NextRequest){
    try{
        const { name, totalQty, price, enabled } = await req.json();

        if (!name || totalQty == null || price == null) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const equipment = await prisma.equipment.create({
            data: {
              name,
              totalQty,
              price,
              enabled: enabled ?? true,
            },
        });

        return NextResponse.json({ equipment });
      
    }catch(err){
        console.error(err);
        return NextResponse.json({ error: "Failed to create equipment" }, { status: 500 });
    }
}

export async function GET(req:NextRequest){
    try {
        const equipment=await prisma.equipment.findMany();
        return NextResponse.json({equipment})
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 });
    }
}