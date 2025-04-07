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
const FileSystem = require("fs");
const { resolve } = require("path");
const multer = require("multer");
const { genreVector } = require("./genreVector");
const { themeVector } = require("./themeVector");
const similarity = require("compute-cosine-similarity");

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

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});

app.get("/", (req, res) => {
  res.send("Express backend is running!");
});

app.get("/search/games", async (req, res) => {
  const { query, limit, sort } = req.query;
  console.log(query);
  console.log(limit);
  console.log(sort);
  try {
    let games = [];
    if (Number(sort) == 0) {
      games = await Game.find({
        name: { $regex: query, $options: "i" },
      })
        .lean()
        .limit(Number(limit));
    } else {
      games = await Game.find({
        name: { $regex: query, $options: "i" },
      })
        .lean()
        .limit(Number(limit))
        .sort({ name: Number(sort) });
    }
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

app.get("/search/users", async (req, res) => {
  const { query } = req.query;
  console.log(query);
  try {
    const [users, admins] = await Promise.all([
      User.find({ username: { $regex: query, $options: "i" } })
        .select("username image")
        .lean()
        .limit(10)
        .sort({ username: 1 }),

      Admin.find({ username: { $regex: query, $options: "i" } })
        .select("username image")
        .lean()
        .limit(10)
        .sort({ username: 1 }),
    ]);
    const searchResults = [...users, ...admins]
      .sort((user1, user2) => user1.username.localeCompare(user2.username))
      .slice(0, 9);

    res.status(200).json({
      message: "Search Success",
      results: searchResults,
      admins: admins,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving users" });
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

app.get("/login/developer", async (req, res) => {
  const { username, password } = req.query;
  console.log(
    `Attempting login developer with Username: ${username} and Password: ${password}`
  );
  return await loginAccount("Admin", username, password, res);
});

app.post("/register/developer", async (req, res) => {
  const { username, password } = req.body;
  console.log(
    `Attempting register developer with Username: ${username} and Password: ${password}`
  );
  const credentialAccept = validateCredentials(username, password);
  if (credentialAccept != "Valid") {
    return res.status(400).json({ message: credentialAccept });
  }
  return await registerAccount("Developer", username, password, res);
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
  console.log(
    id,
    reaction,
    newLikes,
    newDislikes,
    userState,
    reactedPrior,
    reviewId
  );
  try {
    var findResponse = [];
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
      findResponse = await Game.findOne(
        {
          id: id,
          "played_by.review.review_id": new mongoose.Types.ObjectId(reviewId),
        }

        // "played_by.review.review_id": new mongoose.Types.ObjectId(reviewId), // Match the review's ID
      );
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
      findResponse = await Game.findOne({
        id: id,

        "played_by.review.review_id": new mongoose.Types.ObjectId(reviewId),
      });
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
    console.log(findResponse);
    console.log(reactionResponse);
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
    const oldFile = req.body;
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
      if (oldImage !== "") {
        const uploadsPath = path.join(__dirname, "uploads");
        FileSystem.unlink(path.join(uploadsPath, oldFile), (error) => {
          if (error) {
            console.error(`Deleting old file failure: ${error}`);
          } else {
            console.log("Deleted old file");
          }
        });
      }
      res
        .status(200)
        .json({ message: `Update Image Success}`, image: fileName });
    } catch (error) {
      res.status(500).json({ message: `Update Image Failure: ${error}` });
    }
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
    const userResponse = await schema
      .findOne({
        username: username,
      })
      .populate([
        {
          path: "games_played.game_id",
          select: "genres themes keywords name platforms",
        },
        { path: "favourite_games.first", select: "name cover" },
        { path: "favourite_games.second", select: "name cover" },
        { path: "favourite_games.third", select: "name cover" },
        // { path: "games_played.review" },
      ]);
    console.log(userResponse);
    res.status(200).json({ message: "Get User Success", user: userResponse });
  } catch (error) {
    res.status(500).json({ message: `Get User Failure: ${error}` });
  }
});

app.get("/get/:userType/:username/recommendations", async (req, res) => {
  const username = req.params.username;
  const userType = req.params.userType;
  console.log(`Getting user data of ${username} from the ${userType} table`);
  var schema = User;
  if (userType === "Admin") {
    schema = Admin;
  } else if (userType === "Developer") {
    res
      .status(404)
      .json({ message: `Developer cannot recieve recommendations: ${error}` });
    return;
  }
  try {
    let recommendations = await getGameRecommendations(username, schema);
    // console.log("Recommended Games:", recommendations);
    console.log("Bazinga");
    res.status(200).json({
      message: "Get User Success",
      recommendations: recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: `Get User Failure: ${error}` });
  }
});

app.post(
  "/set/:userType/:username/favourites/:game/:position",
  async (req, res) => {
    const game = req.params.game;
    const userType = req.params.userType;
    const position = req.params.position;
    const username = req.params.username;
    const userState = req.body;
    console.log(userState);
    console.log(
      `Changing favoruite games list with ${game} in ${position} place`
    );
    var schema = User;
    if (userType === "Admin") {
      schema = Admin;
    } else if (userType === "Developer") {
      res.status(500).json({ message: "Developer cannot set favoruite games" });
    }
    const oldFavourites = userState.favouriteGames;
    const newFavourites = {};
    // console.log(position);
    if (
      new mongoose.Types.ObjectId(oldFavourites?.first?._id).equals(
        new mongoose.Types.ObjectId(game)
      )
    ) {
      oldFavourites.first = null;
    }
    if (
      new mongoose.Types.ObjectId(oldFavourites?.second?._id).equals(
        new mongoose.Types.ObjectId(game)
      )
    ) {
      oldFavourites.second = null;
    }
    if (
      new mongoose.Types.ObjectId(oldFavourites?.third?._id).equals(
        new mongoose.Types.ObjectId(game)
      )
    ) {
      oldFavourites.third = null;
    }
    console.log(oldFavourites?.third, new mongoose.Types.ObjectId(game));
    console.log(oldFavourites);
    if (position == 0) {
      newFavourites.first = new mongoose.Types.ObjectId(game);
      if (oldFavourites?.first != null) {
        newFavourites.second = new mongoose.Types.ObjectId(
          oldFavourites?.first?._id
        );
        if (oldFavourites?.second != null) {
          newFavourites.third = new mongoose.Types.ObjectId(
            oldFavourites?.second?._id
          );
        } else {
          newFavourites.third = new mongoose.Types.ObjectId(
            oldFavourites?.third?._id
          );
        }
      } else {
        newFavourites.second = new mongoose.Types.ObjectId(
          oldFavourites?.second?._id
        );
        newFavourites.third = new mongoose.Types.ObjectId(
          oldFavourites?.third?._id
        );
      }
    } else if (position == 1) {
      newFavourites.first = new mongoose.Types.ObjectId(
        oldFavourites?.first?._id
      );
      newFavourites.second = new mongoose.Types.ObjectId(game);
      if (oldFavourites?.second != null) {
        newFavourites.third = new mongoose.Types.ObjectId(
          oldFavourites?.second?._id
        );
      } else {
        newFavourites.third = new mongoose.Types.ObjectId(
          oldFavourites?.third?._id
        );
      }
    } else {
      newFavourites.first = new mongoose.Types.ObjectId(
        oldFavourites?.first?._id
      );
      newFavourites.second = new mongoose.Types.ObjectId(
        oldFavourites?.second?._id
      );
      newFavourites.third = new mongoose.Types.ObjectId(game);
    }
    try {
      // console.log(newFavourites);
      const favouriteUpdate = await schema
        .findOneAndUpdate(
          { username: username },
          { $set: { favourite_games: newFavourites } },
          { returnDocument: "after" }
        )
        .select("favourite_games")
        .populate([
          { path: "favourite_games.first", select: "name cover" },
          { path: "favourite_games.second", select: "name cover" },
          { path: "favourite_games.third", select: "name cover" },
        ]);
      // console.log(favouriteUpdate);
      res.status(200).json({
        message: "Successfully updated favourite games",
        favourites: favouriteUpdate.favourite_games,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to update user's favourite games",
        error: error,
      });
    }
  }
);

app.get("/leaderboard/:sortBy", async (req, res) => {
  const sortBy = req.params.sortBy;
  const filterData = req.query;
  console.log(filterData);
  const filters = parseFilters(filterData);
  console.log(filters);
  console.log("Bazinga");
  try {
    const response = await Game.find(filters)
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

function parseFilters(filterData) {
  if (filterData.average_hours_played) {
    filterData.average_hours_played.$gte = Number(
      filterData.average_hours_played.$gte
    );
    filterData.average_hours_played.$lte = Number(
      filterData.average_hours_played.$lte
    );
  }
  if (filterData.average_times_played) {
    filterData.average_times_played.$gte = Number(
      filterData.average_times_played.$gte
    );
    filterData.average_times_played.$lte = Number(
      filterData.average_times_played.$lte
    );
  }
  if (filterData.average_rating) {
    filterData.average_rating.$gte = Number(filterData.average_rating.$gte);
    filterData.average_rating.$lte = Number(filterData.average_rating.$lte);
  }
  if (filterData.records_made) {
    filterData.records_made.$gte = Number(filterData.records_made.$gte);
    filterData.records_made.$lte = Number(filterData.records_made.$lte);
  }

  return filterData;
}

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
        image: "",
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
  console.log(type);
  var schema = User;
  if (type === "Admin") {
    schema = Admin;
  } else if (type === "Developer") {
    schema = Developer;
  }
  try {
    const passwordHash = getHash(password);
    var response = {};
    if (schema === Developer) {
      response = await schema.findOne({
        username: username,
        password: passwordHash,
      });
    } else {
      response = await schema
        .findOne({ username: username, password: passwordHash })
        .populate([
          { path: "favourite_games.first", select: "name cover" },
          { path: "favourite_games.second", select: "name cover" },
          { path: "favourite_games.third", select: "name cover" },
        ]);
    }
    console.log(response);
    console.log(response.image);
    if (response) {
      return res.status(200).json({
        message: "Login Success",
        userId: response._id,
        username: username,
        image: response.image,
        favouriteGames: response.favourite_games,
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

async function getFavourites(schema, username) {
  try {
    const getFavouritesResponse = await schema
      .findOne({ username: username })
      .select("favourite_games");
    console.log(getFavouritesResponse);
    return getFavouritesResponse;
  } catch (error) {
    console.error(error);
  }
}

// async function updateFavouriteGenres(userType, userId) {
//   var schema = User;
//   if (userType === "Admin") {
//     schema = Admin;
//   } else if (userType === "Developer") {
//     return [];
//   }
//   try {
//     const getGamesPlayed = await schema
//       .find({ _id: userId })
//       .select("games_played")
//       .populate({ path: "games_played.game_id", select: "genre" });
//     console.log(getGamesPlayed);
//   } catch (error) {
//     console.log(`Error geting favourites: ${error}`);
//     return;
//   }
//   var genrePopCopy = Object.assign({}, genrePop);
//   games_played.forEach((game) => {
//     game._id.genres.forEach((genre) => {
//       if (genres.some((g) => g.name === genre)) {
//         genrePopCopy[genre] = (genrePopCopy[genre] || 0) + 1;
//       }
//     });
//   });
//   console.log(genrePopCopy);
//   console.log(length(getGamesPlayed));
//   Object.keys(genrePopCopy).forEach((key) => {
//     genrePopCopy[key] = genrePopCopy[key] / getGamesPlayed.length;
//   });
// }

function jaccardSimilarity(setA, setB) {
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function confidenceScore(game) {
  const rating = (game.average_rating || 0) / 5;
  const records = game.records_made || 0;
  const confidence = Math.log(1 + records) / 3;
  return rating * confidence;
}

function cosineVector(gameVector, baseVector) {
  return baseVector.map((v) => (gameVector.has(v) ? 1 : 0));
}

// function calculateUserPrefernceVector()

async function getGameRecommendations(username, schema) {
  try {
    console.log("Getting user recommendations");
    const user = await schema
      .findOne({ username: username })
      .populate([
        { path: "favourite_games.first" },
        { path: "favourite_games.second" },
        { path: "favourite_games.third" },
        { path: "games_played.game_id" },
      ]);

    if (!user) {
      console.log("User not found");
      return [];
    }

    let userGames = new Set();
    try {
      if (user.favourite_games.first)
        userGames.add(user.favourite_games.first._id.toString());
    } catch (error) {
      console.log("1st Favourite not specified");
    }
    try {
      if (user.favourite_games.second)
        userGames.add(user.favourite_games.second._id.toString());
    } catch (error) {
      console.log("2nd Favourite not specified");
    }
    try {
      if (user.favourite_games.third)
        userGames.add(user.favourite_games.third._id.toString());
    } catch (error) {
      console.log("3rd Favourite not specified");
    }
    user.games_played.forEach((game) =>
      userGames.add(game.game_id._id.toString())
    );
    console.log(user.games_played);

    let userGenres = new Set();
    let userThemes = new Set();
    let userKeywords = new Set();
    let relevantGenres = new Set();
    let relevantThemes = new Set();
    let relevantKeywords = new Set();
    let gameArray = Array.from(userGames);
    let userThemeVector = new Array(themeVector.length).fill(0);
    let userGenreVector = new Array(genreVector.length).fill(0);

    gameArray = gameArray.map((gameId) => new mongoose.Types.ObjectId(gameId));
    const gameDataArray = await Game.find({ _id: { $in: gameArray } });

    const totalHoursPlayed = user.games_played.reduce(
      (total, game) => total + game.hours_played,
      1
    );
    const totalRevisits = user.games_played.reduce(
      (total, game) => total + game.times_played,
      1
    );
    // console.log(gameDataArray);
    // let index = 0;
    for (let gameData of user.games_played) {
      if (gameData) {
        let favouriteBias = 1;
        // console.log(gameData);
        if (
          user.favouriteGames?.first?._id.toString() ==
            gameData.game_id._id.toString() ||
          user.favouriteGames?.third?._id.toString() ==
            gameData.game_id._id.toString() ||
          user.favouriteGames?.second?._id.toString() ==
            gameData.game_id._id.toString()
        ) {
          favouriteBias = 5;
        }
        const rating = gameData.rating || 0;
        const playCount = gameData.times_played || 1;
        const hoursPlayed = gameData.hours_played || 1;

        gameData.game_id?.genres.forEach((genre) => {
          const genreIndex = genreVector.indexOf(genre.name);
          // console.log(genreVector, genre.name, genreVector.indexOf(genre.name));
          if (genreIndex !== -1) {
            userGenreVector[genreIndex] +=
              (rating / 5) *
              Math.sqrt(hoursPlayed) *
              Math.log2(playCount) *
              favouriteBias;
          }
        });

        gameData.game_id?.themes.forEach((theme) => {
          const themeIndex = themeVector.indexOf(theme.name);
          // console.log(themeVector, theme.name, themeVector.indexOf(theme.name));
          if (themeIndex !== -1) {
            userThemeVector[themeIndex] +=
              (rating / 5) *
              Math.sqrt(hoursPlayed) *
              Math.log2(playCount) *
              favouriteBias;
          }
        });

        gameData.game_id?.genres.forEach((genre) => {
          relevantGenres.add(genre);
          userGenres.add(genre.name);
        });
        gameData.game_id?.themes.forEach((theme) => {
          relevantThemes.add(theme);
          userThemes.add(theme.name);
        });
        gameData.game_id?.keywords.forEach((keyword) => {
          relevantKeywords.add(keyword);
          userKeywords.add(keyword.name);
        });

        // let playedGame = user.games_played.find(
        //   (g) => g.game_id._id.toString() === gameArray[index]
        // );
        // if (playedGame) {
        //   console.log(`${gameData.game_id._id} has been played`);
        //   userRatings.push(playedGame.rating || 0);
        //   userHoursPlayed.push(playedGame.hours_played || 0);
        //   userTimesPlayed.push(playedGame.times_played || 0);
        // }
      }
      // index = index + 1;
    }
    let relevantGames = await Game.aggregate([
      {
        $match: {
          $or: [
            { genres: { $in: Array.from(relevantGenres) } },
            { themes: { $in: Array.from(relevantThemes) } },
            { keywords: { $in: Array.from(relevantKeywords) } },
          ],
        },
      },
    ]);
    console.log(relevantGames.length);
    console.log(userThemeVector, themeVector);
    console.log(userGenreVector, genreVector);
    let recommendations = [];
    for (let game of relevantGames) {
      if (userGames.has(game._id.toString())) continue;
      // console.log(game);
      // console.log(themeVector);
      // console.log(genreVector);
      // console.log(new Set(game?.genres.map((genre) => (genre = genre.name))));
      let gameGenres = cosineVector(
        new Set((game?.genres ?? []).map((genre) => genre.name)),
        genreVector
      );
      let gameThemes = cosineVector(
        new Set((game?.themes ?? []).map((theme) => theme.name)),
        themeVector
      );
      // console.log(gameGenres, userGenreVector);
      // console.log(gameThemes, userThemeVector);
      let genreScore = similarity(userGenreVector, gameGenres);
      let themeScore = similarity(userThemeVector, gameThemes);
      // let gameGenres = new Set((game.genres ?? []).map((g) => g.name));
      // let gameThemes = new Set((game.themes ?? []).map((t) => t.name));
      let gameKeywords = new Set((game.keywords ?? []).map((k) => k.name));
      // let genreSim = jaccardSimilarity(userGenres, gameGenres);
      // let themeSim = jaccardSimilarity(userThemes, gameThemes);
      let keywordScore = jaccardSimilarity(userKeywords, gameKeywords);
      // finalScore =
      //   0.7 * (0.35 * genreSim + 0.35 * themeSim + 0.3 * keywordSim) +
      //   0.3 * confidenceScore(game);
      let finalScore =
        0.3 * genreScore +
        0.3 * themeScore +
        0.25 * keywordScore +
        0.15 * confidenceScore(game);
      recommendations.push({ game, finalScore });
    }
    recommendations.sort((a, b) => b.finalScore - a.finalScore);
    console.log(recommendations.length);

    return recommendations.slice(0, 50);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
}

// async function getUserRecommendations(userschema) {
//   let recommendations = await getGameRecommendations("USER_ID_HERE", schema);
//   console.log("Recommended Games:", recommendations);
//   return recommendations;
// }
