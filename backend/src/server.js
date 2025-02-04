require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Game = require("../src/mongoose_models/Game");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Enable JSON parsing

const azureAPI = "http://localhost:7071/" || process.env.AZUREAPI;

mongoose
  .connect(
    process.env.MONGODB_URL ||
      "mongodb+srv://rm8g22:YVFDtnZZT7k7m2aH@rm8g22-project-database.xkyqq.mongodb.net/Third_Year_Project?retryWrites=true&w=majority&appName=rm8g22-project-database",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const db = mongoose.connection;
const gameCollection = db.collection("Games");

app.get("/", (req, res) => {
  res.send("Express backend is running!");
});

app.get("/search", async (req, res) => {
  const { query } = req.query;
  console.log(query);
  try {
    const games = await Game.find({
      name: { $regex: query, $options: "i" },
    }).limit(10);
    console.log(games);
    res.json(games);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving games" });
  }
});

app.get("/gamedata", async (req, res) => {
  const { id } = req.query;
  console.log("Requested Game ID:", id);

  try {
    const game = await Game.findOne({ id: id }); // Ensure `id` matches your schema field
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    console.log("Game Data:", game);
    res.json(game);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ message: "Error retrieving game data" });
  }
});

app.get("/imagefetch", async (req, res) => {
  const { coverID } = req.query;
  // console.log(req);
  console.log("Requested Cover:", coverID);

  try {
    const response = await axios
      .get(azureAPI + "getimageid", {
        params: { coverId: coverID },
      })
      .catch((error) => {
        console.error("Error during Axios request:", error);
      });
    console.log("Image Data:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ message: "Error retrieving game data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function getAssociatedImage(coverId) {
  const access = os.getenv("TWITCH_ACCESS");
  const apiUrl = "https://api.igdb.com/v4/covers";
  const headers = {
    "Client-ID": "c9amzjhdtblmmr4yl5rxd2obhs085u",
    Authorization: `bearer ${access}`,
  };
  const body = `fields image_id; where id = ${coverId};`;
  try {
    const requestResponse = requests.post(
      apiUrl,
      (data = body),
      (headers = headers)
    );
    const jsonResponse = requestResponse.json();
    logging.info(jsonResponse[0]);
    return jsonResponse[0]["image_id"];
  } catch (e) {
    return e;
  }
}
