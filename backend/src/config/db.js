const mongoose = require("mongoose");

let nativeDBConnection;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected: ${conn.connection.host}`)
        nativeDBConnection = conn.connection.db;
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1);
    }
}

const getNativeDB = () => {
    if(!nativeDBConnection) {
        throw new Error("Database not connected yet");
    }

    return nativeDBConnection;
}

module.exports = {connectDB, getNativeDB};
