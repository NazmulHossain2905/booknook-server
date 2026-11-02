import cors from "cors";
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import { logger } from "./utils/logger.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

const PORT = process.env.PORT ?? 5000;

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: `Server is running...`,
    data: {
      _id: "booknook",
      project: "BookNook Server",
      client: "https://booknook-online.vercel.app",
    },
  });
});

app.listen(PORT, () => {
  logger.success(`Server is running on PORT: ${PORT}`);
});
