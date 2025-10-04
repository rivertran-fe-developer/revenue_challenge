import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);

    console.log("lien ket thanh cong");
  } catch (error) {
    console.error("loi ket noi db", error);
    process.exit(1); // exit with error (status failed 1 - succed 0)
  }
};
