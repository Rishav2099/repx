import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET (req :NextRequest, {params} : {params: Promise<{id: string}>}) {
    try {
        const {id} = await params;

        await connectToDatabase();

        if(!id) {
            return new NextResponse('Id not found', {status: 400})
        }

        const friend = await User.findById(id);

        if(!friend){
            return NextResponse.json("Friends not found", {status: 404})
        }

        return  NextResponse.json(friend)
    } catch (error) {
        console.log("[FRIEND_ID_GET]", error);
        return new NextResponse("Internal server Error", {status: 500})
    }
}