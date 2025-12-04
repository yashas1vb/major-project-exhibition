import mongoose from 'mongoose';

import { MongoMemoryServer } from 'mongodb-memory-server';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collabcode');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log('Could not connect to local MongoDB. Starting in-memory database...');
        try {
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            const conn = await mongoose.connect(uri);
            console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
            console.log(`In-Memory URI: ${uri}`);
        } catch (memError) {
            console.error(`Error starting in-memory DB: ${memError}`);
            process.exit(1);
        }
    }
};
