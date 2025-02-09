
import app from "./app.js";

import cloudinary from "cloudinary"
cloudinary.v2.config({
    cloud_name: process.env.CLOUDNIARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})
const server=app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});

process.on('uncaughtException', (error) => {
    console.error(`Uncaught Exception in worker ${process.pid}:`, error);
    // Gracefully shut down the worker
    server.close(() => {
      process.exit(1); // Exit with failure code
    });
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error(`Unhandled Rejection in worker ${process.pid}:`, reason);
    // Gracefully shut down the worker
    server.close(() => {
      process.exit(1); // Exit with failure code
    });
  });