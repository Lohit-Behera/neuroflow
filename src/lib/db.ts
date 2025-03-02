import mongoose from "mongoose";

const mongodbUri = process.env.MONGODB_URI;
if (!mongodbUri) {
  throw new Error("Please add your Mongo URI to .env");
}

export const connectToDb = async () => {
  let cached = global.mongoose;

  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
    };

    cached.promise = mongoose
      .connect(mongodbUri, opts)
      .then(() => mongoose.connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.log("MongoDB connection error");
    throw error;
  }

  return cached.conn;
};
