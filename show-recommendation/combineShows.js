const fs = require("fs");

const kdramas = JSON.parse(
  fs.readFileSync("./data/kdramas.json", "utf8")
);

const cdramas = JSON.parse(
  fs.readFileSync("./data/cdramas.json", "utf8")
);

const shows = [
  ...kdramas,
  ...cdramas
];

fs.writeFileSync(
  "./data/shows.json",
  JSON.stringify(shows, null, 2)
);

console.log(`K-dramas: ${kdramas.length}`);
console.log(`C-dramas: ${cdramas.length}`);
console.log(`Total shows: ${shows.length}`);
console.log("Created: data/shows.json");
