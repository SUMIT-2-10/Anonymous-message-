import mongoose from "mongoose";
import { ca } from "zod/locales";

type DBConnectOptions = {
    isConnected?: number;
}

const DBconnect: DBConnectOptions = {}

async function connectToDB(): Promise<void> {
    if (DBconnect.isConnected) {
        console.log("Already connected to database");
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {})

        DBconnect.isConnected = db.connections[0].readyState;
        console.log("Connected to database");
    }catch (error) {
        console.error("Error connecting to database", error);
        process.exit(1);
    }}

export default connectToDB;