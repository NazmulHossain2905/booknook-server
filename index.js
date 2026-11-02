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

// GET /books — get all books (public)
app.get("/books", async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 0);
    const allBooks = await booksCollection.find().limit(limit).toArray();

    res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      data: allBooks,
    });
  } catch (error) {
    console.error(error);
  }
});

// GET /books/:id — get one book
app.get("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    const book = await booksCollection.findOne({ _id: new ObjectId(id) });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book retrieved successfully",
      data: book,
    });
  } catch (error) {
    console.error(error);
  }
});

// PATCH /books/:id — update a book
app.patch("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    const { _id, addedAt, updatedAt, ...updatedData } = req.body;

    const updatedDoc = {
      ...updatedData,
      updatedAt: new Date(),
    };

    const result = await booksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedDoc },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const updatedBook = await booksCollection.findOne({
      _id: new ObjectId(id),
    });

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => {
  logger.success(`Server is running on PORT: ${PORT}`);
});
