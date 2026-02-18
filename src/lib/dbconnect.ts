import mongoose from "mongoose";
import { ca } from "zod/locales";

type DBConnectOptions = {
    isConnected?: number;
}

const dbConnect: DBConnectOptions = {}

async function connectToDB(): Promise<void> {
    if (dbConnect.isConnected) {
        console.log("Already connected to database");
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {})

        dbConnect.isConnected = db.connections[0].readyState;
        console.log("db.connections[0].readyState", db.connections);
        console.log("db", db);
        console.log("Connected to database");
    }catch (error) {
        console.error("Error connecting to database", error);
        process.exit(1);
    }}

export default connectToDB;