import { NextResponse,NextRequest } from "next/server";
import { z } from "zod"
import prisma from "@/lib/prisma";

const createCourtSchema = z.object({
    name: z.string().min(1),
    type: z.enum(["INDOOR", "OUTDOOR"]),
    basePrice: z.number().positive(),
})

export async function POST(req:NextRequest){
    try{
        
        const {name,type,basePrice,enabled}=await req.json();

        if(!name || !type || !basePrice){
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }


        const court=await prisma.court.create({
            data:{
                name,
                basePrice,
                type,
                enabled:enabled ?? true,
            },
        });

        return NextResponse.json({court})

    }catch(err){
        console.error(err);
        return NextResponse.json({ error: "Failed to create court" }, { status: 500 });
    }

}

export async function GET(){
    try {
        const courts=await prisma.court.findMany({
            orderBy:{id:'asc'}
        });
        return NextResponse.json(courts);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch courts" }, { status: 500 });
    }
}