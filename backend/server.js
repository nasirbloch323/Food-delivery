import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();
const port = process.env.PORT || 4000;
app.use(express.json({ limit: "2mb" }));
app.use(cors());
app.use("/api/food", foodRouter);
app.use("/images", express.static(process.env.UPLOAD_DIR || "uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (_req, res) => res.status(200).send("MESA food service is running"));
app.get("/health", (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({ status: databaseReady ? "ok" : "waiting-for-database", database: mongoose.connection.readyState });
});

const start = async () => {
  try {
    await connectDB();
    app.listen(port, "0.0.0.0", () => console.log(`MESA API listening on port ${port}`));
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};
start();
