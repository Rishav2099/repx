import { getDataFromToken } from "@/helper/getDataFromToken";
import { connectToDatabase } from "@/lib/db";
import users from "@/models/users";
import Workout from "@/models/workout";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectToDatabase()
        const decodedToken = getDataFromToken(request)
        const user = await users.findOne({ name: decodedToken.name }).populate('workouts');

        // if no workouts are found 
        if (!user) {
            return NextResponse.json(
                { message: 'No workout found', success: 'false', error: 'true' },
                { status: 404 }
            )
        }

        // if user have workout then return workout
        return NextResponse.json(
            { message: 'workout found', success: 'true', workouts: user.workouts || [] },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error fetching workouts:", error.message);
        return NextResponse.json(
            { message: 'Internal server error', success: false, error: true },
            { status: 500 }
        );
    }
}