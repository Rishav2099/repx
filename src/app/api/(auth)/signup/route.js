'use server'
import { connectToDatabase } from "@/lib/db";
import User from "@/models/users";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

export async function POST(request) {
    try {
        // await connectToDatabase();

        const body = await request.json();
        const { name, password } = body;

        if (!name || !password) {
            return NextResponse.json(
                { message: "Missing required fields", success: false, error: true },
                { status: 400 }
            );
        }

        const existName = await User.findOne({ name });
        if (existName) {
            return NextResponse.json(
                {
                    message: "Name already exists",
                    success: false,
                    error: true,
                    redirectTo: "/login" // Include redirection URL
                },
                { status: 409 }
            );
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({ name, password: hashedPassword });

        const token = jwt.sign({ name }, process.env.JWT_SECRET);

        const response = NextResponse.json(
            { message: "User created successfully", success: true, newUser },
            { status: 201 }
        );

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });

        return response;

    } catch (error) {
        console.error("Error occurred:", error);
        return NextResponse.json(
            { message: "Failed to save data", success: false, error: error.message },
            { status: 500 }
        );
    }
}
