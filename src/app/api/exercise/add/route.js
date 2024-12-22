import { NextResponse } from "next/server"
import exercise from "@/models/exercise"
import { connectToDatabase } from "@/lib/db"

export async function POST(request) {
    try {
        await connectToDatabase()
        const body = await request.json()
        const { name, gif, description, muscleTargeted, createdBy } = body

        if (!name || !muscleTargeted) {
            return NextResponse.json(
                { message: 'Name or Muscle Target of exercise is required' }
            )
        }

        const newExercise = await exercise.create({ name, gif, description, muscleTargeted, createdBy })
        if (!newExercise) {
            return NextResponse.json(
                { message: 'error while creating new exercise', success: false, error: true },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { message: 'exercise created', success: true, newExercise }
        )
    } catch (error) {
        return NextResponse.json(
            { message: "Error creating exercise", success: false, error: error.message },
            { status: 500 }
          );
    }
}