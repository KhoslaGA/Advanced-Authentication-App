import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // const connect = await mongoose.connect(
    //   "mongodb+srv://gautamkhosla75:kIfeuscHk2a2q9xl@users.curku.mongodb.net/?retryWrites=true&w=majority&appName=Users"
    // );
    const connect = await mongoose.connect(process.env.mongo_url);

    console.log(`Database Connected":${connect.connection.host}`);
  } catch (error) {
    console.log("Error Connection to MongoDB:", error.message);
    process.exit(1);
    //*1-failure and 0- success
  }
};
