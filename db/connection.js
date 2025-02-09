import mongoose from "mongoose";

export const connection = () => {
  try {
    mongoose.connect(process.env.MONGO_URL,{ 
   
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,});
    console.log("Database connected");
    
  } catch (error) {
    console.log(error);
  }
};
