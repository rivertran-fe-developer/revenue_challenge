import express from "express";
import evenueRoute from "./routes/evenueRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();

// middleware
app.use(express.json());
app.use(cors());
app.use("/api/revenue", evenueRoute);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server start in port ${PORT}`);
  });
});
