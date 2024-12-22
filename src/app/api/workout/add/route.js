import { NextResponse } from 'next/server';
import workout from '@/models/workout';
import users from '@/models/users';
import { getDataFromToken } from '@/helper/getDataFromToken';
import { connectToDatabase } from '@/lib/db';

export async function POST(request) {
    const body = await request.json();
    const { workouts, name } = body;

    if (!workouts || !name || !Array.isArray(workouts) || workouts.length === 0) {
        return NextResponse.json(
            { message: 'No workouts provided', success: false, error: true },
            { status: 400 }
        );
    }

    try {
        await connectToDatabase()
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

        // create the workout
        const newWorkout = await workout.create({
            name,
            exercises: workouts.map(({ exercise, duration }) => ({
                exercise,
                duration,
            })),
            createdBy: user._id, 
        });

        user.workouts.push(newWorkout._id)
        await user.save()

        return NextResponse.json(
            { message: 'Workout created successfully', success: true, newWorkout },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error saving workout:', error);
        return NextResponse.json(
            { message: 'Failed to save workout', success: false, error: true },
            { status: 500 }
        );
    }
}
