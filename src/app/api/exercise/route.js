import exercise from "@/models/exercise";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category"); // Extract 'category' from query parameters

        let exercises;

        if (category === 'all') {
            // Fetch exercises filtered by category
            exercises = await exercise.find();
        } 

        return NextResponse.json({ success: true, exercises });
    } catch (error) {
        console.error("Error fetching exercises:", error.message);
        return NextResponse.json(
            { message: "Internal server error", success: false },
            { status: 500 }
        );
    }
}
