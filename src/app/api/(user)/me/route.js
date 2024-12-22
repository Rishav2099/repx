import { getDataFromToken } from "@/helper/getDataFromToken";
import { connectToDatabase } from "@/lib/db";
import users from "@/models/users";
import { NextResponse } from "next/server";


export async function GET(request) {
    await connectToDatabase()
    try {
        const decodedToken = await getDataFromToken(request)
        const user = await users.findOne({name: decodedToken.name})
        if (!user) {
            return NextResponse.json({message: 'user not found'})
        }
        return NextResponse.json({
            message: 'user found',
            user
        })
    } catch (error) {
        return NextResponse.json({error: error.message})
    }
}