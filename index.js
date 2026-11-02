import cors from "cors";
import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";
import morgan from "morgan";
import { logger } from "./utils/logger.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const PORT = process.env.PORT ?? 5000;

/* ---------------- CONNECT TO MONGODB DATABASE ----------------- */
const DB_URI = process.env.MONGODB_URI;

const client = new MongoClient(DB_URI);

const connectToMongoDB = async () => {
  try {
    await client.connect();
    logger.success("You have successfully connect to MongoDB");
    return client;
  } catch (error) {
    console.dir(error);
  }
};

const mongoClient = await connectToMongoDB();
const db = mongoClient.db("booknook");
const booksCollection = db.collection("books");
const borrowsCollection = db.collection("borrows");

/* ---------------- HOME ROUTE ----------------- */
// GET: / — Home route
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

/* ---------------- BOOK ROUTES ----------------- */
// POST /books — add a book
app.post("/books", async (req, res) => {
  try {
    const bookDoc = {
      ...req.body,
      addedAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await booksCollection.insertOne(bookDoc);

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: {
        _id: result.insertedId,
        ...bookDoc,
      },
    });
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => {
  logger.success(`Server is running on PORT: ${PORT}`);
});
