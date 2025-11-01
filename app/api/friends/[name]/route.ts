import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Friend from "@/models/Friend";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    await connectToDatabase();

    if (!name) {
      return new NextResponse("Name not found", { status: 400 });
    }

    // get logged in user
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const friends = await User.find({
      $and: [
        {
          $or: [
            { name: { $regex: name, $options: "i" } },
            { userName: { $regex: name, $options: "i" } },
          ],
        },
        { _id: { $ne: userId } },
      ],
    }).populate({
      path: 'friends',
      select: 'requester recipient status'
    });

    if (friends.length === 0) {
      return NextResponse.json("Friends not found", { status: 404 });
    }

    return NextResponse.json(friends);
  } catch (error) {
    console.log("[FRIEND_NAME_GET]", error);
    return new NextResponse("Internal server Error", { status: 500 });
  }
}
