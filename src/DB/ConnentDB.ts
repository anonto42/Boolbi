import mongoose from 'mongoose';
import config from '../config';
const DBConnection = async () => {
    const MONGO_URI = config.db_url;
    const DB_NAME = config.db_name;
    
    if (!MONGO_URI) {
        throw new Error("DATABASE_URL environment variable is not defined!");
    }
    
    let isConnected: boolean = false;
    
    if (isConnected) {
        console.log("Using existing database connection!");
        return mongoose;
    }
    
    try {

        const db = await mongoose.connect(`${MONGO_URI}/${DB_NAME}`)

        console.log("Database connected!");  
      
        return db;
        
    } catch (error) {
        
        console.error("MongoDB connection error:", error);
        // This will the global error
        throw new Error("Failed to connect to the database");

    }
}

export default DBConnection;