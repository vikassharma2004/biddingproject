import express from "express";
import { config } from "dotenv";
import fileupload from "express-fileupload";
import { connection } from "./db/connection.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/error.js";
import UserRouter from "./routes/User.Router.js";
import AuctionRouter from "./routes/Auction.route.js";
import BidsRouter from "./routes/Bid.route.js";
import CommisonRoute from "./routes/Commision.route.js";
import superAdminRouter from "./routes/SuperAdmin.route.js"
import { endedAuction } from "./automation/endedauction.cron.js";
import { verifyCommissionCron } from "./automation/verifycommisioncron.js";

// Load environment variables
config({ path: "./config/config.env" });

const app = express();

// Middleware setup
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// Routes
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/auctions", AuctionRouter);
app.use("/api/v1/bids", BidsRouter);
app.use("/api/v1/commison", CommisonRoute);
app.use("/api/v1/superadmin", superAdminRouter);
endedAuction()
verifyCommissionCron()
// Database connection
connection();

// Global error handling middleware
app.use(errorMiddleware);

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ message: `Server is running successfully` });
});

export default app;