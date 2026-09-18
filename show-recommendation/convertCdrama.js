const fs = require("fs");
const csv = require("csv-parser");

const cdramas = [];

fs.createReadStream("./cdrama/top_5000_dramas.csv")
  .pipe(csv())
  .on("data", (row) => {

    // Keep only Chinese dramas
    if (row.Language?.toLowerCase().includes("chinese")) {

      cdramas.push({
        title: row.Name?.trim(),

        category: "cdrama",

        type: "tv",

        description: null,

        genres: [],

        tags: [],

        releaseYear: row["Released Year"]
          ? Number(row["Released Year"])
          : null,

        language: "Chinese",

        episodes: row.Episodes
          ? Number(row.Episodes)
          : null,

        duration: null,

        rating: row.Rating
          ? Number(row.Rating)
          : null,

        ratingCount: null,

        directors: [],

        creators: [],

        cast: [],

        studio: null,

        sourceMaterial: null,

        status: null,

        season: null,

        poster: null,

        source: "Top 5000 Asian Dramas Dataset"
      });
    }
  })
  .on("end", () => {

    fs.writeFileSync(
      "./data/cdramas.json",
      JSON.stringify(cdramas, null, 2)
    );

    console.log(`Found ${cdramas.length} Chinese dramas.`);
    console.log("Created: data/cdramas.json");
  });