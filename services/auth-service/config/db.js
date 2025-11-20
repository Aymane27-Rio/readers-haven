import mongoose from "mongoose";

let mongoServer;

const connectDB = async () => {
  try {
    let uri;

    if (process.env.NODE_ENV === "test") {
      // in-mem db for tests (only load dependency in test env)
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    } else {
      // real db for prod and dev
      uri = process.env.MONGO_URI;
    }

    if (!uri) {
      throw new Error("MongoDB URI is missing");
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

// this one is for the tests
export const closeDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

export default connectDB;
