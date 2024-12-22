import { getDataFromToken } from "@/helper/getDataFromToken"
import { connectToDatabase } from "@/lib/db"
import users from "@/models/users"
import WorkoutLog from "@/models/workoutLog"
import { NextResponse } from "next/server"

export async function POST(request) {
    await connectToDatabase()
    try {
        const body = await request.json()
        const {workoutName, exercises, totalTime} = body

        const decodedToken = await getDataFromToken(request)
        
                if (!decodedToken) {
                    return NextResponse.json(
                        { message: 'User not authenticated', success: false, error: true },
                        { status: 401 }
                    )
                }
        
                //fetch userid by name
                const user = await users.findOne({name: decodedToken.name})
                if (!user) {
                    return NextResponse.json(
                        { message: 'User not found', success: false, error: true },
                        { status: 404 }
                    );
                }

        if (!workoutName || !exercises) {
            return NextResponse.json(
                {messsage: 'no workout logs are provided', success: false, error: true},
                {status: 400}
            )
        }
    
        const workoutLog = await WorkoutLog.create({
            workoutName,
            exercises,
            totalTime,
            createdBy: user._id

        })

        if (!workoutLog) {
            return NextResponse.json(
                { message: 'unable to create workout log server error', success: false, error: true},
                {status: 500}
            )
        }

        return NextResponse.json(
            {message: 'workoutlog created successfully', success: true, workoutLog},
            {status: 200}
        )
    } catch (error) {
        console.error("Error posting workouts log:", error.message);
        return NextResponse.json(
            { message: 'Internal server error', success: false, error: true },
            { status: 500 }
        );
    }
}