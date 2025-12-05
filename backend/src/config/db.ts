import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collabcode');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error}`);
        // Do not use in-memory DB in production as it crashes Render
        console.error('Failed to connect to MongoDB. Exiting...');
        process.exit(1);
    }
};
