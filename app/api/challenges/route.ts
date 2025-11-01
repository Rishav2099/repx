import { connectToDatabase } from "@/lib/db";
import Challenge from "@/models/Challenge";
import Friend from "@/models/Friend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const {
      challengeName,
      description,
      reps,
      forDays,
      startDate,
      challenger,
      challengee,
    } = body;

    if (
      !challengeName ||
      !reps ||
      !forDays ||
      !startDate ||
      !challenger ||
      !challengee
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + forDays)

    const challenge = await Challenge.create({
        challengeName,
        description,
        reps,
        forDays,
        challenger,
        challengee,
        startDate,
        endDate,
    });
    
    await Friend.findOneAndUpdate(
        {
            $or: [
                {requester: challenger, recipient: challengee},
                {requester: challengee, recipient: challenger},
            ],
        },
        {$push: {challenges: challenge._id}},
        {new: true}
    )

    return NextResponse.json(challenge)

  } catch (error) {
    return NextResponse.json('Internal server error', {status: 500})
  }
}
