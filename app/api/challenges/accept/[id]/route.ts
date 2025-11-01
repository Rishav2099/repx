import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Challenge from "@/models/Challenge";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return NextResponse.json("No challenge found", { status: 404 });
    }

    if (challenge.challenger.toString() === userId) {
      return NextResponse.json("You cannot accept your own challenge", {
        status: 400,
      });
    }

    if (challenge.challengee.toString() === userId) {
      challenge.status = "accepted";
      const now = new Date();
      challenge.startDate = now;
      challenge.endDate = new Date(
        now.getTime() + challenge.forDays * 24 * 60 * 60 * 1000
      );

      await challenge.save();
      return NextResponse.json(challenge);
    }

    return NextResponse.json("Unauthorized action", { status: 403 });
  } catch (error) {
    console.log(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
