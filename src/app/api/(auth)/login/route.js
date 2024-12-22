import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import users from "@/models/users";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

export async function POST(request) {

   try {
     await connectToDatabase()
 
     const body = await request.json()
     const { name, password } = body
 
     if (!name || !password) {
         return NextResponse.json(
             { message: "Missing required fields", success: false, error: true },
             { status: 400 }
         );
     }
 
     let existUser = await users.findOne({ name })
 
     if (!existUser) {
         return NextResponse.json(
             { message: 'Something went wrong ', success: 'false', error: true },
             { status: 401 }
         )
     }
 
     let isPasswordValid = await bcrypt.compare(password, existUser.password)

     if (!isPasswordValid) {
         return NextResponse.json(
             { message: 'password galat h', success: 'false', error: true },
             {status: 401}
         )
     }
 
     // Create a JWT token
     const token = jwt.sign({ name }, process.env.JWT_SECRET);
 
     const response = NextResponse.json(
         {message: 'user logged in', success: true, user: existUser},
         {status: 200}
     )
 
     response.cookies.set('token', token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         path: "/",
         maxAge: 3600, // 1 hour in seconds
     })
 
     return response
   } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(
        { message: "Failed to save data", success: false, error: error.message },
        { status: 500 }
    );
   }

}