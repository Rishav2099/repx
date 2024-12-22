import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please add your MongoDB URI to .env.local");
}

let isConnected = false; // Track the connection status

export async function connectToDatabase() {
    if (isConnected) return; // Use existing connection

    try {
        const db = await mongoose.connect(MONGODB_URI); // No additional options needed
        isConnected = db.connections[0].readyState === 1;
        console.log("Connected to MongoDB via Mongoose");
    } catch (error) {
        console.error("Failed to connect to MongoDB via Mongoose:", error);
        throw error;
    }
}
