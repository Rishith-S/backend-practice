import mongoose from 'mongoose';

const mongoDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL!);
        console.log("Connected to MongoDB");
      } catch (err) {
        console.error("Error connecting to MongoDB:", err);
      }

};

export default mongoDb