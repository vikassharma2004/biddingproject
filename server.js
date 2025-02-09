import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";
import app from "./app.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);

  const numCPUs = availableParallelism();
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`
    );
    console.log("Forking a new worker...");
    cluster.fork();
  });
} else {
  // Assign unique port per worker
  const PORT = Number(process.env.PORT) + cluster.worker.id;

  const server = app.listen(PORT, () => {
    console.log(
      `Worker ${cluster.worker.id} running on port http://localhost:${PORT}`
    );
  });

  // Root route
  app.get("/", (req, res) => {
    res.status(200).json({
      message: `Server is running successfully on worker ${process.pid}`,
    });
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error(`Uncaught Exception in worker ${process.pid}:`, error);
    server.close(() => process.exit(1)); // Gracefully shut down worker
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error(`Unhandled Rejection in worker ${process.pid}:`, reason);
    server.close(() => process.exit(1)); // Gracefully shut down worker
  });
}
