import express from "express";
import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";
import { config } from "dotenv";
import fileupload from "express-fileupload";
import { connection } from "./db/connection.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errormiddleware } from "./middleware/error.js";
import UserRouter from "./routes/User.Router.js";
import AuctionRouter from "./routes/Auction.route.js";
import BidsRouter from "./routes/Bid.route.js";
import CommisonRoute from "./routes/Commision.route.js";
//  fork process
const app = express();
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers based on the number of CPUs
  const numCPUs = availableParallelism();
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker exit events
  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`
    );
    console.log("Forking a new worker...");
    cluster.fork(); // Fork a new worker to replace the dead one
  });
} else {
  // Worker process
  console.log(`Worker ${process.pid} started`);
}

config({
  path: "./config/config.env",
});

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
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/auctions", AuctionRouter);
app.use("/api/v1/bids", BidsRouter);
app.use("/api/v1/commison", CommisonRoute);
connection();
app.use(errormiddleware);
app.get("/", (req, res) => {
  try {
    res.status(200).json({ message: `server running success full${process.pid} `});
  } catch (error) {
    console.error(`Error in worker ${process.pid}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at", promise, "reason:", reason);
  process.exit(1);
});



export default app;