const { MongoClient } = require("mongodb");
const fs = require("fs");

const uri = "mongodb+srv://leviken24_db_user:aSwmSNITfD57DykW@cluster0.toq6wjk.mongodb.net/?appName=Cluster0"

const client = new MongoClient(uri);

async function importShows() {
  try {
    await client.connect();

    console.log("Connected to MongoDB!");

    const database = client.db("showRecommendationDB");
    const collection = database.collection("shows");

    const shows = JSON.parse(
      fs.readFileSync("./data/shows.json", "utf8")
    );

    console.log(`Found ${shows.length} shows.`);

    const result = await collection.insertMany(shows);

    console.log(`Successfully inserted ${result.insertedCount} shows.`);
  } catch (error) {
    console.error("Import failed:", error);
  } finally {
    await client.close();
  }
}

importShows();


// leviken24_db_user

// zLpBdQRzYSOypHad