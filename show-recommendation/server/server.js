const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://leviken24_db_user:aSwmSNITfD57DykW@cluster0.toq6wjk.mongodb.net/?appName=Cluster0";
const client = new MongoClient(MONGO_URI);

let db;

async function connectDB() {
  await client.connect();
  db = client.db("showRecommendationDB");
  console.log("Connected to MongoDB!");
}

// Home
app.get("/", (req, res) => {
  res.json({
    message: "Show Recommendation API is running!"
  });
});

// Get shows + category filter
app.get("/api/shows", async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    const shows = await db
      .collection("shows")
      .find(filter)
      .limit(20)
      .toArray();

    res.json(shows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch shows"
    });
  }
});

// Search shows
app.get("/api/shows/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        message: "Search query is required"
      });
    }

    const shows = await db
      .collection("shows")
      .find({
        title: {
          $regex: q,
          $options: "i"
        }
      })
      .limit(20)
      .toArray();

    res.json(shows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Search failed"
    });
  }
});

// Get one show by ID
app.get("/api/shows/:id", async (req, res) => {
  try {
    const show = await db
      .collection("shows")
      .findOne({
        _id: new ObjectId(req.params.id)
      });

    if (!show) {
      return res.status(404).json({
        message: "Show not found"
      });
    }

    res.json(show);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch show"
    });
  }
});

// Register user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (
      !name ||
      !email ||
      !password ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    const existingUser = await db
      .collection("users")
      .findOne({
        email: {
          $regex: `^${trimmedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i"
        }
      });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      name: name.trim(),
      email: trimmedEmail,
      password: hashedPassword,
      preferences: {
        genres: [],
        languages: [],
        types: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db
      .collection("users")
      .insertOne(user);

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertedId
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration failed"
    });
  }
});

// Login user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    const user = await db
      .collection("users")
      .findOne({
        email: {
          $regex: `^${trimmedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i"
        }
      });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "showRecommendationSecretKey_jwt_token_super_secure_2026";
    const token = jwt.sign(
      {
        _id: user._id,
        userId: user._id,
        email: user.email
      },
      jwtSecret,
      { expiresIn: "7h" }
    );

    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed"
    });
  }
});

// ─── Auth Middleware ────────────────────────────────────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "showRecommendationSecretKey_jwt_token_super_secure_2026";
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ─── Interactions ───────────────────────────────────────────────────────────
const UNIQUE_TYPES = ["like", "dislike", "completed"];
const ALL_TYPES    = ["like", "dislike", "view", "rating", "completed"];

// POST /api/interactions
app.post("/api/interactions", authenticateToken, async (req, res) => {
  try {
    const { showId, type, rating } = req.body || {};
    const userId = req.user._id || req.user.userId;

    // Validate showId
    if (!showId || typeof showId !== "string" || !showId.trim()) {
      return res.status(400).json({ message: "showId is required" });
    }

    // Validate type
    if (!type || !ALL_TYPES.includes(type)) {
      return res.status(400).json({
        message: `type must be one of: ${ALL_TYPES.join(", ")}`
      });
    }

    // Validate rating value when type is "rating"
    if (type === "rating") {
      const ratingNum = Number(rating);
      if (rating === undefined || rating === null || isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
        return res.status(400).json({ message: "rating must be a number between 1 and 10" });
      }
    }

    // Verify the show exists
    let showObjId;
    try {
      showObjId = new ObjectId(showId.trim());
    } catch {
      return res.status(400).json({ message: "Invalid showId format" });
    }

    const showExists = await db.collection("shows").findOne(
      { _id: showObjId },
      { projection: { _id: 1 } }
    );
    if (!showExists) {
      return res.status(404).json({ message: "Show not found" });
    }

    const userObjId = new ObjectId(String(userId));
    const now = new Date();

    if (UNIQUE_TYPES.includes(type)) {
      // Upsert: one record per (userId, showId, type)
      const interactionDoc = {
        userId: userObjId,
        showId: showObjId,
        type,
        updatedAt: now
      };
      if (type === "rating") {
        interactionDoc.rating = Number(rating);
      }

      const result = await db.collection("interactions").findOneAndUpdate(
        { userId: userObjId, showId: showObjId, type },
        {
          $set: interactionDoc,
          $setOnInsert: { createdAt: now }
        },
        { upsert: true, returnDocument: "after" }
      );

      const saved = result || interactionDoc;
      return res.status(200).json({
        message: `${type} recorded`,
        interaction: { ...saved, _id: saved._id || undefined }
      });
    }

    // For "view" and "rating" — always insert a new record
    const newDoc = {
      userId: userObjId,
      showId: showObjId,
      type,
      createdAt: now,
      updatedAt: now
    };
    if (type === "rating") {
      // For rating, also upsert so user can update their rating
      newDoc.rating = Number(rating);
      const result = await db.collection("interactions").findOneAndUpdate(
        { userId: userObjId, showId: showObjId, type: "rating" },
        {
          $set: { rating: Number(rating), updatedAt: now },
          $setOnInsert: { userId: userObjId, showId: showObjId, type: "rating", createdAt: now }
        },
        { upsert: true, returnDocument: "after" }
      );
      const saved = result || newDoc;
      return res.status(200).json({
        message: "Rating saved",
        interaction: saved
      });
    }

    const result = await db.collection("interactions").insertOne(newDoc);
    res.status(201).json({
      message: `${type} recorded`,
      interaction: { ...newDoc, _id: result.insertedId }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save interaction" });
  }
});

// GET /api/interactions/me  — return current user's interactions
app.get("/api/interactions/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const userObjId = new ObjectId(String(userId));

    const interactions = await db
      .collection("interactions")
      .find({ userId: userObjId })
      .sort({ updatedAt: -1 })
      .toArray();

    res.json(interactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch interactions" });
  }
});

// GET /api/interactions/show/:showId  — interactions for a single show (current user)
app.get("/api/interactions/show/:showId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const userObjId = new ObjectId(String(userId));

    let showObjId;
    try {
      showObjId = new ObjectId(req.params.showId);
    } catch {
      return res.status(400).json({ message: "Invalid showId" });
    }

    const interactions = await db
      .collection("interactions")
      .find({ userId: userObjId, showId: showObjId })
      .toArray();

    res.json(interactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch show interactions" });
  }
});

// ─── Watchlist ──────────────────────────────────────────────────────────────

// POST /api/watchlist — add a show to watchlist
app.post("/api/watchlist", authenticateToken, async (req, res) => {
  try {
    const { showId } = req.body || {};
    const userId = req.user._id || req.user.userId;

    if (!showId || typeof showId !== "string" || !showId.trim()) {
      return res.status(400).json({ message: "showId is required" });
    }

    let showObjId;
    try {
      showObjId = new ObjectId(showId.trim());
    } catch {
      return res.status(400).json({ message: "Invalid showId format" });
    }

    const showExists = await db.collection("shows").findOne(
      { _id: showObjId },
      { projection: { _id: 1 } }
    );
    if (!showExists) {
      return res.status(404).json({ message: "Show not found" });
    }

    const userObjId = new ObjectId(String(userId));

    // Prevent duplicate: same user adding same show
    const existingEntry = await db.collection("watchlists").findOne({
      userId: userObjId,
      showId: showObjId
    });

    if (existingEntry) {
      return res.status(409).json({ message: "Show already in watchlist" });
    }

    const newDoc = {
      userId: userObjId,
      showId: showObjId,
      addedAt: new Date()
    };

    const result = await db.collection("watchlists").insertOne(newDoc);

    return res.status(201).json({
      message: "Show added to watchlist",
      watchlist: { ...newDoc, _id: result.insertedId }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to add show to watchlist" });
  }
});

// GET /api/watchlist — get the logged-in user's watchlist
app.get("/api/watchlist", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const userObjId = new ObjectId(String(userId));

    const watchlistItems = await db.collection("watchlists").aggregate([
      { $match: { userId: userObjId } },
      { $sort: { addedAt: -1 } },
      {
        $lookup: {
          from: "shows",
          localField: "showId",
          foreignField: "_id",
          as: "showDetails"
        }
      },
      { $unwind: "$showDetails" }
    ]).toArray();

    const shows = watchlistItems.map(item => ({
      ...item.showDetails,
      _id: item.showDetails._id,
      showId: item.showId,
      userId: item.userId,
      addedAt: item.addedAt,
      show: item.showDetails
    }));

    return res.status(200).json(shows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch watchlist" });
  }
});

// DELETE /api/watchlist/:showId — remove a show from watchlist
app.delete("/api/watchlist/:showId", authenticateToken, async (req, res) => {
  try {
    const { showId } = req.params;
    const userId = req.user._id || req.user.userId;

    if (!showId || typeof showId !== "string" || !showId.trim()) {
      return res.status(400).json({ message: "showId is required" });
    }

    let showObjId;
    try {
      showObjId = new ObjectId(showId.trim());
    } catch {
      return res.status(400).json({ message: "Invalid showId format" });
    }

    const userObjId = new ObjectId(String(userId));

    const result = await db.collection("watchlists").deleteOne({
      userId: userObjId,
      showId: showObjId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Show not found in watchlist" });
    }

    return res.status(200).json({ message: "Show removed from watchlist" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to remove show from watchlist" });
  }
});

const PORT = 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });