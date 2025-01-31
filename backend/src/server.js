require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
// A time-based function that runs every day at midnight
cron.schedule("10 * * * *", () => {
  console.log("Running the daily task at midnight!");
  // Add your task logic here (e.g., database cleanup, sending daily reports, etc.)
});

app.use(express.json()); // Enable JSON parsing

app.get("/", (req, res) => {
  res.send("Express backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  app.on();
});
