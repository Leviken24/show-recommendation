const fs = require("fs");
const csv = require("csv-parser");

const shows = [];

fs.createReadStream("./data/KdramadatasetMDL.csv")
  .pipe(csv())
  .on("data", (row) => {
    const scoreMatch = row.Score?.match(/[\d.]+/);
    const countMatch = row.Score?.match(/[\d,]+(?=\s*scored)/);

    const show = {
      title: row.Title?.trim(),

      category: "kdrama",

      type: "tv",

      description: row.Synopsis?.trim(),

      genres: row.Genres
        ? row.Genres.split(",").map(item => item.trim())
        : [],

      tags: row.Tags
        ? row.Tags.split(",").map(item => item.trim())
        : [],

      releaseYear: row.Year ? Number(row.Year) : null,

      episodes: row.Episodes ? Number(row.Episodes) : null,

      duration: row.Duration?.trim(),

      language: "Korean",

      screenwriters: row.Screenwriter
        ? row.Screenwriter.split(",").map(item => item.trim())
        : [],

      directors: row.Director
        ? row.Director.split(",").map(item => item.trim())
        : [],

      cast: row.Cast
        ? row.Cast.split(",").map(item => item.trim())
        : [],

      network: row.Network?.trim(),

      contentRating: row.ContentRating?.trim(),

      rating: scoreMatch ? Number(scoreMatch[0]) : null,

      ratingCount: countMatch
        ? Number(countMatch[0].replace(/,/g, ""))
        : null,

      rank: row.Rank ? Number(row.Rank) : null,

      popularity: row.Popularity ? Number(row.Popularity) : null,

      watchers: row.Watchers ? Number(row.Watchers) : null,

      watchPlatforms: row["Where to Watch"]
        ? row["Where to Watch"]
            .split(",")
            .map(item => item.trim())
        : [],

      sourceUrl: row.URL?.trim()
    };

    shows.push(show);
  })
  .on("end", () => {
    fs.writeFileSync(
      "./data/kdramas.json",
      JSON.stringify(shows, null, 2)
    );

    console.log(`Converted ${shows.length} shows.`);
    console.log("Created: data/kdramas.json");
  });