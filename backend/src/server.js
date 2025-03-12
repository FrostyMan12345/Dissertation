require("dotenv").config({ path: "../../.env" });
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Game = require("./mongoose_models/GameSchema");
const User = require("./mongoose_models/UserSchema");
const Admin = require("./mongoose_models/AdminSchema");
const Developer = require("./mongoose_models/DeveloperSchema");
const mongoose = require("mongoose");
const crypto = require("crypto");
const path = require("path");
const { resolve } = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

app.use(express.json());

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
process.env.TWITCH_ACCESS = getCredentials();

app.get("/", (req, res) => {
  res.send("Express backend is running!");
});

app.get("/search", async (req, res) => {
  const { query } = req.query;
  console.log(query);
  try {
    const games = await Game.find({
      name: { $regex: query, $options: "i" },
    })
      .lean()
      .limit(10)
      .sort({ name: 1 });
    console.log(games);
    games.forEach((game) => {
      game = parseGameData(game);
    });
    res.json(games);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving games" });
  }
});

app.get("/game/:id/data", async (req, res) => {
  const { id } = req.params;
  // console.log("Requested Game ID:", id);
  try {
    var game = await Game.findOne({ id: id })
      .populate("played_by.user_id")
      .lean();
    // console.log(await User.findOne({ _id: game.played_by[0].user_id }));
    // console.log(await Admin.findOne({ _id: game.played_by[0].user_id }));
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    game = parseGameData(game);
    console.log("Game Data:", game);
    res.json(game);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ message: "Error retrieving game data" });
  }
});

app.get("/login/user", async (req, res) => {
  const { username, password } = req.query;
  console.log(
    `Attempting login user with Username: ${username} and Password: ${password}`
  );
  return await loginAccount("Users", username, password, res);
});

app.post("/register/user", async (req, res) => {
  const { username, password } = req.body;
  console.log(
    `Attempting register user with Username: ${username} and Password: ${password}`
  );
  const credentialAccept = validateCredentials(username, password);
  if (credentialAccept != "Valid") {
    return res.status(400).json({ message: credentialAccept });
  }
  return await registerAccount("Users", username, password, res);
});

app.get("/login/admin", async (req, res) => {
  const { username, password } = req.query;
  console.log(
    `Attempting login admin with Username: ${username} and Password: ${password}`
  );
  return await loginAccount("Admin", username, password, res);
});

app.post("/register/admin", async (req, res) => {
  const { username, password } = req.body;
  console.log(
    `Attempting register admin with Username: ${username} and Password: ${password}`
  );
  const credentialAccept = validateCredentials(username, password);
  if (credentialAccept != "Valid") {
    return res.status(400).json({ message: credentialAccept });
  }
  return await registerAccount("Admin", username, password, res);
});

app.post("/game/:id/record/make", async (req, res) => {
  const id = req.params.id;
  const {
    userState,
    rating,
    timesPlayed,
    hoursPlayed,
    review = {},
    game,
  } = req.body;
  var schema = "";
  var userType = "";
  if (userState.developer) {
    res.status(400).json({ message: "Developer cannot log games" });
    return;
  } else if (userState.admin) {
    schema = Admin;
    userType = "Admin";
  } else {
    schema = User;
    userType = "User";
  }
  // console.log(review);
  // console.log(userType);
  console.log(Object.keys(review).length === 0);
  const reviewId = new mongoose.Types.ObjectId();
  try {
    var playedBy = {};
    var gamesPlayed = {};
    if (Object.keys(review).length === 0) {
      console.log("Review Not Being added");
      playedBy = {
        $push: {
          played_by: {
            user_id: new mongoose.Types.ObjectId(userState.userId),
            user_type: userType,
            rating: rating,
            hours_played: hoursPlayed,
            times_played: timesPlayed,
          },
        },
      };
      gamesPlayed = {
        $push: {
          games_played: {
            game_id: new mongoose.Types.ObjectId(game._id),
            rating: rating,
            hours_played: hoursPlayed,
            times_played: timesPlayed,
          },
        },
      };
    } else {
      console.log("Review Being added");
      review.review_id = reviewId;
      playedBy = {
        $push: {
          played_by: {
            user_id: new mongoose.Types.ObjectId(userState.userId),
            user_type: userType,
            rating: rating,
            hours_played: hoursPlayed,
            times_played: timesPlayed,
            review: review,
          },
        },
      };
      gamesPlayed = {
        $push: {
          games_played: {
            game_id: new mongoose.Types.ObjectId(game._id),
            rating: rating,
            hours_played: hoursPlayed,
            times_played: timesPlayed,
            review: reviewId,
          },
        },
      };
    }
    // console.log(gamesPlayed);
    // console.log(playedBy);
    const updateResponse = await Game.findOneAndUpdate({ id: id }, playedBy, {
      returnDocument: "after",
    });
    const updateUserResponse = await schema.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userState.userId) },
      gamesPlayed,
      {
        returnDocument: "after",
      }
    );
    res.status(200).json({ message: "Success", response: updateResponse });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ message: `Error updating game data ${error}` });
  }
});

app.post("/game/:id/record/edit", async (req, res) => {
  const id = req.params.id;
  const {
    userState,
    rating,
    timesPlayed,
    hoursPlayed,
    review = {},
    game,
  } = req.body;
  var schema = "";
  var userType = "";
  if (userState.developer) {
    res.status(400).json({ message: "Developer cannot log games" });
    return;
  } else if (userState.admin) {
    schema = Admin;
    userType = "Admin";
  } else {
    schema = User;
    userType = "User";
  }
  // console.log(review);
  // console.log(userType);
  console.log(Object.keys(review).length === 0);
  try {
    var playedBy = {};
    if (Object.keys(review).length === 0) {
      console.log("Review Not Being added");
      playedBy = {
        user_id: new mongoose.Types.ObjectId(userState.userId),
        user_type: userType,
        rating: rating,
        hours_played: hoursPlayed,
        times_played: timesPlayed,
      };
    } else {
      if (review.review_id === -1)
        review.review_id = new mongoose.Types.ObjectId();
      console.log("Review Being added");
      playedBy = {
        user_id: new mongoose.Types.ObjectId(userState.userId),
        user_type: userType,
        rating: rating,
        hours_played: hoursPlayed,
        times_played: timesPlayed,
        review: review,
      };
    }

    const logResponse = await Game.findOneAndUpdate(
      {
        id: id,
        "played_by.user_id": new mongoose.Types.ObjectId(userState.userId), // Find the correct game and user
      },
      {
        $set: {
          "played_by.$": playedBy, // Replace only the matched element
        },
      },
      { returnDocument: "after" }
    );

    console.log(logResponse);
    res.status(200).json({ message: "Success", response: logResponse });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ message: `Error updating game data ${error}` });
  }
});

app.post("/game/:id/reaction/update", async (req, res) => {
  const id = req.params.id;
  const { reaction, newLikes, newDislikes, userState, reactedPrior, reviewId } =
    req.body;
  // console.log(reactedPrior, reaction);
  try {
    var reactionUpdate = {};
    var reactionResponse = [];
    if (reactedPrior) {
      reactionUpdate = {
        $set: {
          "played_by.$[played].review.likes": newLikes,
          "played_by.$[played].review.dislikes": newDislikes,
          "played_by.$[played].review.reactions.$[reactionItem].reaction":
            reaction, // Target specific reaction
        },
      };

      reactionResponse = await Game.findOneAndUpdate(
        {
          id: id, // Match game ID
          "played_by.review.review_id": new mongoose.Types.ObjectId(reviewId), // Match review ID
          "played_by.review.reactions.user_id": new mongoose.Types.ObjectId(
            userState.userId
          ), // Match reaction's user ID
        },
        reactionUpdate,
        {
          arrayFilters: [
            {
              "played.review.review_id": new mongoose.Types.ObjectId(reviewId), // Match review inside played_by
            },
            {
              "reactionItem.user_id": new mongoose.Types.ObjectId(
                userState.userId
              ), // Match specific reaction inside reactions array
            },
          ],
          returnDocument: "after",
        }
      );
    } else {
      reactionUpdate = {
        $push: {
          "played_by.$[played].review.reactions": {
            user_id: new mongoose.Types.ObjectId(userState.userId),
            reaction: reaction,
          },
        },
        $set: {
          "played_by.$[played].review.likes": newLikes,
          "played_by.$[played].review.dislikes": newDislikes,
        },
      };
      reactionResponse = await Game.findOneAndUpdate(
        {
          id: id, // Ensure you're matching the correct game
          "played_by.review.review_id": new mongoose.Types.ObjectId(reviewId), // Match the review's ID
        },
        reactionUpdate,
        {
          arrayFilters: [
            {
              "played.review.review_id": new mongoose.Types.ObjectId(reviewId),
            },
          ],
          returnDocument: "after", // To return the updated document
        }
      );
    }

    // console.log(reactionResponse);
    res.status(200).json({ message: "Reaction Update Success" });
  } catch (error) {
    console.error("Reaction update failed: ", error);
    res.status(500).json({ message: "Failed to update reactions" });
  }
});

app.get("/game/:id/reaction/get", async (req, res) => {
  const id = req.params.id;
  const { userId } = req.query;
  try {
    const reactionResponse = await Game.find({
      id: id,
      "played_by.review.reactions.user_id": new mongoose.Types.ObjectId(userId),
    }).select("played_by.review");
    // console.log(reactionResponse);
    const reviews = reactionResponse.flatMap((game) =>
      game.played_by.flatMap((p) => p.review)
    );
    // console.log(reviews);
    var reviewsReacted = {};
    if (reactionResponse) {
      reviews.forEach((review) => {
        if (review != undefined) {
          reactions = review.reactions;
          // console.log(review);
          // console.log(reactions);
          if (reactions) {
            reactions.forEach((reaction) => {
              if (
                reaction.user_id.equals(new mongoose.Types.ObjectId(userId))
              ) {
                // reviewsReacted.push({
                //   review_id: reviewData.review_id,
                //   reaction: reaction.reaction,
                // });
                reviewsReacted[review.review_id] = reaction.reaction;
                // console.log(reviewsReacted);
              }
            });
          }
        }
      });
    }
    // console.log(reviewsReacted);
    res.status(200).json({
      message: "Reaction Get Success",
      reviews: reviewsReacted,
    });
  } catch (error) {
    console.error("Reaction get failed: ", error);
    res.status(500).json({ message: "Failed to get reactions" });
  }
});

app.get("/game/:id/record/check", async (req, res) => {
  const id = req.params.id;
  const { userId } = req.query;
  // console.log(id, userId);
  try {
    const loggedResponse = await Game.find({
      id: id,
      "played_by.user_id": new mongoose.Types.ObjectId(userId),
    });
    // console.log(loggedResponse);
    if (loggedResponse.length === 0) {
      res.status(200).json({
        message: "Log check Success",
        reviews: loggedResponse,
        logged: false,
      });
    } else {
      res.status(200).json({
        message: "Log check Success",
        reviews: loggedResponse,
        logged: true,
      });
    }
  } catch (error) {
    console.error("Log check failed: ", error);
    res.status(500).json({ message: "Failed to log check" });
  }
});

app.get("/game/:id/record/get", async (req, res) => {
  const id = req.params.id;
  const { userId } = req.query;
  try {
    const logResponse = await Game.find(
      {
        id: id,
        "played_by.user_id": new mongoose.Types.ObjectId(userId),
      },
      {
        played_by: {
          $elemMatch: { user_id: new mongoose.Types.ObjectId(userId) },
        },
      }
    );
    console.log(logResponse);
    // console.log(logResponse[0].played_by);

    res.status(200).json({
      message: "Log Get Success",
      logData: logResponse[0].played_by,
    });
  } catch (error) {
    console.error("Log Get failed: ", error);
    res.status(500).json({ message: "Failed to get log or No Log" });
  }
});

app.post("/game/:id/update", async (req, res) => {
  const id = req.params.id;
  try {
    const dataResponse = await Game.find({ id: id }).select("played_by").lean();
    gameRecords = dataResponse[0].played_by;
    const ratings = [];
    const timesPlayed = [];
    const hoursPlayed = [];
    const recordsCreated = gameRecords.length;
    gameRecords.forEach((record) => {
      ratings.push(record.rating);
      timesPlayed.push(record.times_played);
      hoursPlayed.push(record.hours_played);
    });
    console.log(ratings, timesPlayed, hoursPlayed);
    const averageRating = getAverage(ratings, 0.25, 0.75);
    const averageTimesPlayed = getAverage(timesPlayed, 0.2, 0.75);
    const averageHoursPlayed = getAverage(hoursPlayed, 0.2, 0.75);
    console.log(averageRating, averageTimesPlayed, averageHoursPlayed);
    const updateResponse = await Game.findOneAndUpdate(
      { id: id },
      {
        $set: {
          average_rating: averageRating,
          average_times_played: averageTimesPlayed,
          average_hours_played: averageHoursPlayed,
          records_made: recordsCreated,
        },
      },
      { returnDocument: "after" }
    );
    console.log(updateResponse);
    res.status(200).json({ message: "Updating Data Success" });
  } catch (error) {
    console.log(`Error updating game: ${error}`);
    res.status(500).json({ message: "Updating Data Failed" });
  }
});

app.post(
  "/user/:userType/:id/update-image",
  upload.single("fileToUpload"),
  async (req, res) => {
    const userId = req.params.id;
    const userType = req.params.userType;
    const fileName = req.file.filename;
    console.log(userId, userType, fileName);
    var schema = User;
    if (userType === "Admin") {
      schema = Admin;
    } else if (userType === "Developer") {
      schema = Developer;
    }
    try {
      const newImageCommand = {
        $set: {
          image: fileName,
        },
      };
      // console.log(newImageCommand);
      const updateImageResponse = await schema.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(userId),
        },
        newImageCommand,
        { returnDocument: "after" }
      );
    } catch (error) {
      res.status(500).json({ message: `Update Image Failure: ${error}` });
    }
    res.status(200).json({ message: `Update Image Success}`, image: fileName });
  }
);

app.get("/get/:userType/:username", async (req, res) => {
  const username = req.params.username;
  const userType = req.params.userType;
  console.log(`Getting user data of ${username} from the ${userType} table`);
  var schema = User;
  if (userType === "Admin") {
    schema = Admin;
  } else if (userType === "Developer") {
    schema = Developer;
  }
  try {
    const userResponse = await schema.findOne({
      username: username,
    });
    console.log(userResponse);
    res.status(200).json({ message: "Get User Success", user: userResponse });
  } catch (error) {
    res.status(500).json({ message: `Get User Failure: ${error}` });
  }
});

app.get("/leaderboard/:sortBy", async (req, res) => {
  const sortBy = req.params.sortBy;
  console.log("Bazinga");
  try {
    const response = await Game.find({})
      .select(
        "name cover id average_hours_played average_rating average_times_played records_made"
      )
      .sort({ [sortBy]: -1 })
      .lean();
    console.log(response);
    res
      .status(200)
      .json({ message: "Leaderboard Get Success", leaderboard: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Leaderboard Get Failure" });
  }
});

app.use("/Uploads", express.static("Uploads"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function registerAccount(type, username, password, res) {
  if (type != "Users" && type != "Admin" && type != "Developer") {
    return res.status(500).json({ message: "User type invalid" });
  }
  try {
    const userResponse = await db
      .collection("Users")
      .findOne({ username: username });
    const adminResponse = await db
      .collection("Admin")
      .findOne({ username: username });
    const developerResponse = await db
      .collection("Developer")
      .findOne({ username: username });
    if (!userResponse && !adminResponse && !developerResponse) {
      const passwordHash = getHash(password);
      const registerResponse = await db.collection(type).insertOne({
        username: username,
        password: passwordHash,
        games_played: [],
      });
      console.log(registerResponse);
      return res.status(200).json({
        message: "Register Complete",
        userId: registerResponse.insertedId,
        username: username,
      });
    } else {
      return res.status(400).json({ message: "Username Already Exists" });
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
}

async function loginAccount(type, username, password, res) {
  if (type != "Users" && type != "Admin" && type != "Developer") {
    return res.status(500).json({ message: "User type invalid" });
  }
  try {
    const passwordHash = getHash(password);
    console.log(passwordHash);
    const response = await db
      .collection(type)
      .findOne({ username: username, password: passwordHash });
    console.log(response);
    console.log(response._id);
    console.log(response.image);
    if (response) {
      return res.status(200).json({
        message: "Login Success",
        userId: response._id,
        username: username,
        image: response.image,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Username or Password is inccorect" });
    }
  } catch (error) {
    console.error("Database query error:", error);
    return res.status(500).json({ message: "Error logging in user" });
  }
}

function validateCredentials(username, password) {
  if (username.length >= 5) {
    if (password.length >= 8) {
      return "Valid";
    } else {
      return "Password is not a valid length";
    }
  } else {
    return "Username is not a valid length";
  }
}

function getHash(password) {
  const hash = crypto.createHash("sha256");
  return hash.update(password).digest("hex");
}

function parseGameData(game) {
  game.genres = getGenres(game.genres);
  game.imageId = parseImageId(game.cover);
  game.involved_companies = parseCompanies(game.involved_companies);
  game.keywords = parseKeywords(game.keywords);
  game.themes = parseThemes(game.themes);
  game.expanded_games = parseExpandedGames(game.expanded_games);
  game.ports = parsePorts(game.ports);
  game.platforms = parsePlatforms(game.platforms);
  return game;
}

function parseImageId(coverId) {
  try {
    return coverId["image_id"];
  } catch (error) {
    return "";
  }
}

async function getCredentials() {
  const credentialResponse = await axios
    .get(azureAPI + "credentials/get")
    .catch((error) => {
      console.error("Error during credentials request:", error);
    });
  // console.log(`Credential Data: ${credentialResponse.data.ACCESS}`);
  return credentialResponse.data.ACCESS;
}

function getGenres(genres) {
  var gameGenres = [];
  try {
    genres.forEach((genre) => {
      gameGenres.push(genre["name"]);
    });
  } catch {}
  return gameGenres;
}

function parseCompanies(companyData) {
  var devPubList = { developers: [], publishers: [] };
  try {
    companyData.forEach((company) => {
      if (company["developer"]) {
        devPubList["developers"].push(company["company"]["name"]);
      } else {
        devPubList["publishers"].push(company["company"]["name"]);
      }
    });
  } catch (error) {}
  return devPubList;
}

function parseKeywords(keywords) {
  var keywordNames = [];
  try {
    keywords.forEach((keyword) => {
      keywordNames.push(keyword["name"]);
    });
  } catch {}
  return keywordNames;
}

function parseThemes(themes) {
  var themeNames = [];
  try {
    themes.forEach((theme) => {
      themeNames.push(theme["name"]);
    });
  } catch {}
  return themeNames;
}

function parsePorts(ports) {
  var portNames = [];
  try {
    ports.forEach((port) => {
      portNames.push(port["name"]);
    });
  } catch {}
  return portNames;
}

function parseExpandedGames(expandedGames) {
  var expandedGameNames = [];
  try {
    expandedGames.forEach((game) => {
      expandedGameNames.push(game["name"]);
    });
  } catch {}
  return expandedGameNames;
}

function parsePlatforms(platforms) {
  var platformNames = [];
  platforms.forEach((platform) => {
    platformNames.push(platform["name"]);
  });
  return platformNames;
}

function getAverage(values, lowRange, highRange) {
  console.log(values);
  var average = 0;
  if (values.length > 3) {
    const Q1 = values[Math.floor(values.length * lowRange)];
    const Q3 = values[Math.floor(values.length * highRange)];
    const IQR = Q3 - Q1;
    const lowBound = Q1 - 1.5 * IQR;
    const highBound = Q3 + 1.5 * IQR;
    const valuesToAverage = values.filter(
      (value) => value >= lowBound || value <= highBound
    );
    if (valuesToAverage.length == 0) return 0;
    console.log(valuesToAverage.reduce((total, value) => total + value, 0));
    average =
      valuesToAverage.reduce((total, value) => total + value, 0) /
      valuesToAverage.length;
  } else {
    if (values.length == 0) return 0;
    average = values.reduce((total, value) => total + value, 0) / values.length;
  }
  console.log(average.toFixed(2));
  return parseFloat(average.toFixed(2));
}
