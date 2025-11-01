import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Challenge from "@/models/Challenge";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay } from "date-fns";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { date } = await req.json();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!date) {
      return NextResponse.json("Date not provided", { status: 400 });
    }

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return NextResponse.json("Unable to find challenge", { status: 404 });
    }

    const role =
      challenge.challenger.toString() === userId
        ? "challenger"
        : challenge.challengee.toString() === userId
        ? "challengee"
        : null;

    if (!role) return NextResponse.json("unauthorized", { status: 403 });

    const userDates = challenge.progress[role];

    // 🧠 Normalize date comparison (ignore time)
    const clickedDay = startOfDay(new Date(date)).toISOString();

    const index = userDates.findIndex(
      (d: string) =>
        startOfDay(new Date(d)).toISOString() === clickedDay
    );

    console.log(index);
    

    if (index === -1) {
      userDates.push(clickedDay); // add
    } else {
      userDates.splice(index, 1); // remove (toggle)
    }

    await challenge.save();

    return NextResponse.json(challenge.progress);
  } catch (error) {
    console.log(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
