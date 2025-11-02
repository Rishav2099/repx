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
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    await connectToDatabase();

    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return NextResponse.json("Challenge not found", { status: 404 });
    }

    if (
      challenge.challengee.toString() !== userId ||
      challenge.status !== "accepted"
    ) {
      return NextResponse.json("only challenge can resign challenge", {
        status: 403,
      });
    }

    // Update status
    await Challenge.updateOne(
      { _id: id },
      { $set: { status: "resigned", resignedBy: userId } }
    );

    return NextResponse.json({ message: "Resigned successfully" });
  } catch (error) {
    console.log("Resign error", error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
