require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Enable JSON parsing

app.get("/", (req, res) => {
  res.send("Express backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  app.on();
});
