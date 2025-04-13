require("dotenv").config({ path: "../.env" });
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const User = require("./mongoose_models/UserSchema");
const Admin = require("./mongoose_models/AdminSchema");
const Game = require("./mongoose_models/GameSchema");
const Developer = require("./mongoose_models/DeveloperSchema");
const Companies = require("./mongoose_models/CompanySchema");
const mongoose = require("mongoose");
const crypto = require("crypto");
const path = require("path");
const FileSystem = require("fs");
const { resolve } = require("path");
const multer = require("multer");
const { genreVector } = require("./genreVector");
const { themeVector } = require("./themeVector");
const similarity = require("compute-cosine-similarity");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const nodemailer = require("nodemailer");
const { validate } = require("deep-email-validator");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pictures",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: (req, file) => {
      return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    },
  },
});

// const transporter = nodemailer.createTransport({
//   host: "smtp.office365.com",
//   port: 587, // TLS port
//   secure: false, // Use STARTTLS (not SSL)
//   auth: {
//     user: process.env.EMAIL, // New email address
//     pass: process.env.EMAIL_PASSWORD, // New app password
//   },
//   tls: {
//     rejectUnauthorized: false, // Optional: helps with SSL certificate issues
//   },
// });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const upload = multer({ storage });

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

app.use(express.json());

const azureAPI = "http://localhost:7071/" || process.env.AZUREAPI;

mongoose.set("debug", false);
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
  try {
    let game = await Game.findOne({ id: id })
      .populate({ path: "comments.dev_id", select: "username image" })
      .lean();

    console.log(game);
    // console.log("Raw game:", JSON.stringify(game, null, 2));
    // console.log(await User.findOne({ _id: game.played_by[0].user_id }));
    // console.log(await Admin.findOne({ _id: game.played_by[0].user_id }));
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    game = parseGameData(game);
    // console.log("Game Data:", game);
    if (game.played_by) {
      for (let record of game?.played_by) {
        if (record.user_type == "User") {
          record.user_id = await User.findById(record.user_id).select("image");
        } else if (record.user_type == "Admin") {
          record.user_id = await Admin.findById(record.user_id).select("image");
        }
      }
    }
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
  return await registerAccount("Admin", username, password, res);
});

app.get("/login/developer", async (req, res) => {
  const { username, password } = req.query;
  console.log(
    `Attempting login developer with Username: ${username} and Password: ${password}`
  );
  return await loginAccount("Developer", username, password, res);
});

app.post("/register/developer", async (req, res) => {
  const { username, password, email, request } = req.body;
  console.log(
    `Attempting register developer with Username: ${username}, Password: ${password}, email ${email}, and request ${request}`
  );
  const validEmail = await validate(email);

  if (
    !validEmail.valid &&
    validEmail.reason !== "smtp" &&
    validEmail.reason !== "typo"
  ) {
    console.log(validEmail);
    return res.status(400).json({ message: validEmail.reason });
  }
  return await registerAccount(
    "Developer",
    username,
    password,
    res,
    email,
    request
  );
});

app.post("/validations/:username/developer/:status", async (req, res) => {
  const status = req.params.status;
  const username = req.params.username;
  const { email, selectedCompanies, adminResponse } = req.body;
  console.log({
    status: status,
    username: username,
    email: email,
    selectedComapnies: selectedCompanies,
    adminResponse: adminResponse,
  });
  let userInfo = {};
  try {
    if (status === "1") {
      const companyUpdate = await Companies.updateMany(
        { name: { $in: selectedCompanies } },
        { $set: { hasDeveloper: true } },
        { returnDocument: "after" }
      );
      let companyList = "";
      selectedCompanies.forEach((company) => {
        companyList = companyList + `- ${company}\n`;
      });
      userInfo = await Developer.findOneAndUpdate(
        { username: username },
        {
          $set: {
            verified: true,
            companies: selectedCompanies,
          },
        },
        { returnDocument: "after" }
      );
      console.log(userInfo);
      console.log(companyList);
      try {
        const mailSpecifications = {
          from: process.env.EMAIL,
          to: email,
          subject: `Verification for developer complete`,
          text: `Hello ${username},\n\nWe are emailing you to inform you that our admin team has reviewed your developer request and has verified your account! You may now access your account and make a comment on games you have permissons for.\n\nYou have permissions for games with these involved companies:\n${companyList}\n\n - GameRecords Admin Team\n\nDO NOT REPLY TO TTHIS EMAIL`,
        };

        const emailResponse = await transporter.sendMail(mailSpecifications);
        console.log(emailResponse);

        return res.status(200).json({
          message: "Account Verified",
          info: emailResponse.response,
        });
      } catch (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ message: "Error sending email", error: error });
      }
    } else {
      userInfo = await Developer.findOneAndDelete({ username: username });
      // console.log(email);
      try {
        const mailSpecifications = {
          from: process.env.EMAIL,
          to: email,
          subject: `Verification for developer complete`,
          text: `Hello ${username},\n\nWe are emailing you to inform you that our admin team has reviewed your developer request and has concluded you are not suitable for a developer account.\n\nReason:\n${adminResponse} \n\nYour credentials have been deleted from our database, and your account will be deleted.\n\n - GameRecords Admin Team\n\nDO NOT REPLY TO TTHIS EMAIL`,
        };

        const emailResponse = await transporter.sendMail(mailSpecifications);
        console.log(emailResponse);

        return res.status(200).json({
          message: "Account Deleted",
          info: emailResponse.response,
        });
      } catch (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ message: "Error sending email", error: error });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failure to verify account", error: error });
  }
});

app.get("/developer/requests", async (req, res) => {
  try {
    const requestResponses = await Developer.find({ verified: false }).select(
      "email username request"
    );
    console.log(requestResponses);
    return res.status(200).json({
      message: "Developer accounts to verify found",
      requests: requestResponses,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failure to find developer accounts to verify",
      error: error,
    });
  }
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
  let schema = "";
  let userType = "";
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
    let playedBy = {};
    let gamesPlayed = {};
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
  let schema = "";
  let userType = "";
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
    let playedBy = {};
    let userUpdate = {};
    if (Object.keys(review).length === 0) {
      console.log("Review Not Being added");
      playedBy = {
        user_id: new mongoose.Types.ObjectId(userState.userId),
        user_type: userType,
        rating: rating,
        hours_played: hoursPlayed,
        times_played: timesPlayed,
      };
      userUpdate = {
        game_id: new mongoose.Types.ObjectId(game._id),
        rating: rating,
        hours_played: hoursPlayed,
        times_played: timesPlayed,
      };
    } else {
      if (review.review_id === -1)
        review.review_id = new mongoose.Types.ObjectId();

      console.log("Review Being added: ", review.review_id);
      playedBy = {
        user_id: new mongoose.Types.ObjectId(userState.userId),
        user_type: userType,
        rating: rating,
        hours_played: hoursPlayed,
        times_played: timesPlayed,
        review: review,
      };
      userUpdate = {
        game_id: new mongoose.Types.ObjectId(game._id),
        rating: rating,
        hours_played: hoursPlayed,
        times_played: timesPlayed,
        review: review.review_id,
      };
    }

    const logResponse = await Game.findOneAndUpdate(
      {
        id: id,
        "played_by.user_id": new mongoose.Types.ObjectId(userState.userId),
      },
      {
        $set: {
          "played_by.$": playedBy,
        },
      },
      { returnDocument: "after" }
    );
    const userResponse = await schema.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(userState.userId),
        "games_played.game_id": new mongoose.Types.ObjectId(game._id),
      },
      {
        $set: {
          "games_played.$": userUpdate,
        },
      },
      { returnDocument: "after" }
    );

    console.log(userResponse, "bazingabfekivhb");
    res.status(200).json({ message: "Success", response: logResponse });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ message: `Error updating game data ${error}` });
  }
});

app.post("/game/:id/comment/make", async (req, res) => {
  const id = req.params.id;
  const { userState, comment = {}, game } = req.body;
  if (!userState.developer) {
    res.status(400).json({ message: "Non developer cannot create comments" });
    return;
  }
  console.log(comment);
  // console.log(userType);
  console.log(Object.keys(comment).length === 0);
  const commentId = new mongoose.Types.ObjectId();
  try {
    let commentPush = {};
    let devPush = {};
    comment.dev_id = new mongoose.Types.ObjectId(userState.userId);
    comment.comment_id = commentId;
    console.log(comment);
    commentPush = {
      $push: {
        comments: comment,
      },
    };
    devPush = {
      $push: {
        dev_comments: {
          game_id: new mongoose.Types.ObjectId(game._id),
          comment_id: commentId,
        },
      },
    };
    console.log(commentPush);
    console.log(devPush);
    const updateResponse = await Game.findOneAndUpdate(
      { id: id },
      commentPush,
      {
        returnDocument: "after",
      }
    );
    const updateUserResponse = await Developer.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userState.userId) },
      devPush,
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

app.post("/game/:id/comment/edit", async (req, res) => {
  const id = req.params.id;
  const { userState, comment = {}, game } = req.body;
  if (!userState.developer) {
    res.status(400).json({ message: "Non developer cannot create comments" });
    return;
  }
  console.log(comment);
  console.log("fnihebvihebvebafb");
  // console.log(userType);
  try {
    let commentPush = {};
    // let devUpdate = {};
    comment.dev_id = new mongoose.Types.ObjectId(userState.userId);
    comment.comment_id = new mongoose.Types.ObjectId(comment.comment_id);
    console.log(comment);
    commentUpdate = {
      dev_id: new mongoose.Types.ObjectId(userState.userId),
      likes: comment.likes,
      dislikes: comment.dislikes,
      comment_id: comment.comment_id,
      created: comment.created,
      edited: comment.edited,
      comment: comment.comment,
      reactions: comment.reactions,
    };
    // devUpdate = {
    //   game_id: comment.game_id,
    //   comment_id: comment.comment_id
    // };

    // console.log(commentPush);
    // console.log(devUpdate);

    const updateResponse = await Game.findOneAndUpdate(
      {
        id: id,
        "comments.dev_id": new mongoose.Types.ObjectId(userState.userId),
      },
      {
        $set: {
          "comments.$": comment,
        },
      },
      { returnDocument: "after" }
    );
    // const userResponse = await Developer.findOneAndUpdate(
    //   {
    //     _id: new mongoose.Types.ObjectId(userState.userId),
    //     "games_played.game_id": new mongoose.Types.ObjectId(game._id),
    //   },
    //   {
    //     $set: {
    //       "games_played.$": devUpdate,
    //     },
    //   },
    //   { returnDocument: "after" }
    // );

    res.status(200).json({ message: "Success", response: updateResponse });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ message: `Error updating game data ${error}` });
  }
});

app.post("/game/:id/review/reaction/update", async (req, res) => {
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
    let reactionUpdate = {};
    let reactionResponse = [];
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
    console.log(reactionResponse);
    res.status(200).json({ message: "Reaction Update Success" });
  } catch (error) {
    console.error("Reaction update failed: ", error);
    res
      .status(500)
      .json({ message: "Failed to update reactions", error: error });
  }
});

app.post("/game/:id/comment/reaction/update", async (req, res) => {
  const id = req.params.id;
  const {
    reaction,
    newLikes,
    newDislikes,
    userState,
    reactedPrior,
    commentId,
  } = req.body;
  console.log(
    id,
    reaction,
    newLikes,
    newDislikes,
    userState,
    reactedPrior,
    commentId
  );
  try {
    let reactionUpdate = {};
    let reactionResponse = [];
    if (reactedPrior) {
      reactionUpdate = {
        $set: {
          "comments.$[comment].likes": newLikes,
          "comments.$[comment].dislikes": newDislikes,
          "comments.$[comment].reactions.$[reactionItem].reaction": reaction, // Target specific reaction
        },
      };

      reactionResponse = await Game.findOneAndUpdate(
        {
          id: id, // Match game ID
          "comments.comment_id": new mongoose.Types.ObjectId(commentId), // Match review ID
          "comments.reactions.user_id": new mongoose.Types.ObjectId(
            userState.userId
          ), // Match reaction's user ID
        },
        reactionUpdate,
        {
          arrayFilters: [
            {
              "comment.comment_id": new mongoose.Types.ObjectId(commentId), // Match review inside played_by
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
          "comments.$[comment].reactions": {
            user_id: new mongoose.Types.ObjectId(userState.userId),
            reaction: reaction,
          },
        },
        $set: {
          "comments.$[comment].likes": newLikes,
          "comments.$[comment].dislikes": newDislikes,
        },
      };

      reactionResponse = await Game.findOneAndUpdate(
        {
          id: id, // Ensure you're matching the correct game
          "comments.comment_id": new mongoose.Types.ObjectId(commentId), // Match the review's ID
        },
        reactionUpdate,
        {
          arrayFilters: [
            {
              "comment.comment_id": new mongoose.Types.ObjectId(commentId),
            },
          ],
          returnDocument: "after", // To return the updated document
        }
      );
    }
    console.log(reactionResponse);
    res.status(200).json({ message: "Reaction Update Success" });
  } catch (error) {
    console.error("Reaction update failed: ", error);
    res
      .status(500)
      .json({ message: "Failed to update reactions", error: error });
  }
});

app.get("/game/:id/record/reaction/get", async (req, res) => {
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
    let reviewsReacted = {};
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

app.get("/game/:id/comment/reaction/get", async (req, res) => {
  const id = req.params.id;
  const { userId } = req.query;
  try {
    const reactionResponse = await Game.find({
      id: id,
      "comments.reactions.user_id": new mongoose.Types.ObjectId(userId),
    }).select("comments");
    // console.log(reactionResponse[0].comments);
    // console.log(reactionResponse);

    // console.log(reviews);
    let commentsReacted = {};
    if (reactionResponse) {
      reactionResponse[0]?.comments.forEach((comment) => {
        if (comment != undefined) {
          reactions = comment.reactions;
          console.log(comment);
          console.log(22222222222);
          // console.log(comment[0]);
          console.log(reactions);
          if (reactions) {
            reactions.forEach((reaction) => {
              console.log(reaction);
              if (
                reaction.user_id.equals(new mongoose.Types.ObjectId(userId))
              ) {
                // reviewsReacted.push({
                //   review_id: reviewData.review_id,
                //   reaction: reaction.reaction,
                // });
                commentsReacted[comment.comment_id] = reaction.reaction;
                // console.log(reviewsReacted);
              }
            });
          }
        }
      });
    }
    console.log(commentsReacted);
    console.log("bazinga");
    res.status(200).json({
      message: "Reaction Get Success",
      comments: commentsReacted,
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

app.get("/game/:id/comment/check", async (req, res) => {
  const id = req.params.id;
  const { userId } = req.query;
  // console.log(id, userId);
  try {
    const loggedResponse = await Game.find({
      id: id,
      "comments.dev_id": new mongoose.Types.ObjectId(userId),
    });
    console.log(loggedResponse);
    if (loggedResponse.length === 0) {
      res.status(200).json({
        message: "Log check Success",
        comment: loggedResponse,
        logged: false,
      });
    } else {
      res.status(200).json({
        message: "Log check Success",
        comment: loggedResponse,
        logged: true,
      });
    }
  } catch (error) {
    console.error("Comment check failed: ", error);
    res.status(500).json({ message: "Failed to comment check" });
  }
});

app.get("/game/:id/comment/get", async (req, res) => {
  const id = req.params.id;
  const { userId } = req.query;
  try {
    const logResponse = await Game.find(
      {
        id: id,
        "comments.dev_id": new mongoose.Types.ObjectId(userId),
      },
      {
        comments: {
          $elemMatch: { dev_id: new mongoose.Types.ObjectId(userId) },
        },
      }
    );
    console.log(`Retrieved Comment: ${logResponse}`);
    // console.log(logResponse[0].played_by);

    res.status(200).json({
      message: "Comment Get Success",
      logData: logResponse,
    });
  } catch (error) {
    console.error("Comment Get failed: ", error);
    res.status(500).json({ message: "Failed to get comment or no comment" });
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
    const oldFile = req.body.oldFile;

    const imageUrl = req.file.path;

    console.log(userId, fileName, oldFile, imageUrl);
    let schema = User;
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
      const updateImageResponse = await schema.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(userId),
        },
        newImageCommand,
        { returnDocument: "after" }
      );
      console.log(updateImageResponse);

      if (oldFile && oldFile !== "") {
        await cloudinary.uploader.destroy(oldFile, (error, result) => {
          if (error) {
            console.error("Error deleting old Cloudinary image:", error);
          } else {
            console.log("Old Cloudinary image deleted:", result);
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
  let schema = User;
  if (userType === "Admin") {
    schema = Admin;
  } else if (userType === "Developer") {
    schema = Developer;
  }
  try {
    let userResponse = {};
    if (userType === "Developer") {
      userResponse = await Developer.findOne({
        username: username,
      }).populate([
        {
          path: "dev_comments.game_id",
          select: "genres themes keywords name platforms cover",
        },
        //   { path: "favourite_games.first", select: "name cover" },
        //   { path: "favourite_games.second", select: "name cover" },
        //   { path: "favourite_games.third", select: "name cover" },
        //   // { path: "games_played.review" },
      ]);
    } else {
      userResponse = await schema
        .findOne({
          username: username,
        })
        .populate([
          {
            path: "games_played.game_id",
            select: "genres themes keywords name platforms",
          },
          { path: "favourite_games.first", select: "name cover id" },
          { path: "favourite_games.second", select: "name cover id" },
          { path: "favourite_games.third", select: "name cover id" },
          // { path: "games_played.review" },
        ]);
    }
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
  let schema = User;
  if (userType === "Admin") {
    schema = Admin;
  } else if (userType === "Developer") {
    res
      .status(400)
      .json({ message: `Developer cannot recieve recommendations` });
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
    let schema = User;
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

app.get("/companies", async (req, res) => {
  try {
    const companyResponse = await Companies.find({
      $or: [{ hasDeveloper: { $exists: false } }, { hasDeveloper: false }],
    }).lean();
    console.log(companyResponse);
    res
      .status(200)
      .json({ message: "Get Company Success", companies: companyResponse });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failure during get companies", error: error });
  }
});

app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
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

async function registerAccount(
  type,
  username,
  password,
  res,
  email = null,
  request = null
) {
  if (type != "Users" && type != "Admin" && type != "Developer") {
    return res.status(500).json({ message: "User type invalid" });
  }
  try {
    const userResponse = await User.findOne({ username: username });
    const adminResponse = await Admin.findOne({ username: username });
    const developerResponse = await Developer.findOne({ username: username });
    console.log(!userResponse && !adminResponse && !developerResponse);
    console.log(userResponse, adminResponse, developerResponse);
    if (!userResponse && !adminResponse && !developerResponse) {
      const passwordHash = getHash(password);
      let registerResponse = {};
      if (type === "Developer") {
        registerResponse = await db.collection(type).insertOne({
          username: username,
          password: passwordHash,
          email: email,
          dev_comments: [],
          verified: false,
          request: request,
          image: "",
        });

        try {
          const mailSpecifications = {
            from: process.env.EMAIL,
            to: email,
            subject: `Verification for developer begun`,
            text: `Hello ${username},\n\nThis email is to confirm that verification for your developer account for GameRecords has begun. Our admin team shall view your credentials to ensure that you are suitable for this account. \n\nMore emails may be sent requetsing more information. \n\nYour Request:\n${request} \n\n- GameRecords Admin Team \n\nDO NOT REPLY TO TTHIS EMAIL`,
          };

          const emailResponse = await transporter.sendMail(mailSpecifications);
          console.log(emailResponse);

          return res.status(200).json({
            message: "Awaiting Verification",
            info: emailResponse.response,
          });
        } catch (error) {
          console.error("Error sending email:", error);
          return res
            .status(500)
            .json({ message: "Error sending email", error: error });
        }
      } else {
        registerResponse = await db.collection(type).insertOne({
          username: username,
          password: passwordHash,
          games_played: [],
          image: "",
        });
      }
      console.log(registerResponse);
      return res.status(200).json({
        message: "Register Complete",
        userId: registerResponse.insertedId,
        username: username,
        email: email,
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
  let schema = User;
  if (type === "Admin") {
    schema = Admin;
  } else if (type === "Developer") {
    schema = Developer;
  }
  try {
    const passwordHash = getHash(password);
    let response = {};
    if (type === "Developer") {
      response = await schema.findOne({
        // email: email,
        username: username,
        password: passwordHash,
        verified: true,
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
    if (response) {
      return res.status(200).json({
        message: "Login Success",
        userId: response._id,
        username: username,
        image: response.image,
        favouriteGames: response.favourite_games,
        companies: response.companies,
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
  let gameGenres = [];
  try {
    genres.forEach((genre) => {
      gameGenres.push(genre["name"]);
    });
  } catch {}
  return gameGenres;
}

function parseCompanies(companyData) {
  let devPubList = { developers: [], publishers: [] };
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
  let keywordNames = [];
  try {
    keywords.forEach((keyword) => {
      keywordNames.push(keyword["name"]);
    });
  } catch {}
  return keywordNames;
}

function parseThemes(themes) {
  let themeNames = [];
  try {
    themes.forEach((theme) => {
      themeNames.push(theme["name"]);
    });
  } catch {}
  return themeNames;
}

function parsePorts(ports) {
  let portNames = [];
  try {
    ports.forEach((port) => {
      portNames.push(port["name"]);
    });
  } catch {}
  return portNames;
}

function parseExpandedGames(expandedGames) {
  let expandedGameNames = [];
  try {
    expandedGames.forEach((game) => {
      expandedGameNames.push(game["name"]);
    });
  } catch {}
  return expandedGameNames;
}

function parsePlatforms(platforms) {
  let platformNames = [];
  platforms.forEach((platform) => {
    platformNames.push(platform["name"]);
  });
  return platformNames;
}

function getAverage(values, lowRange, highRange) {
  console.log(values);
  let average = 0;
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

function confidenceScore(game) {
  const rating = (game.average_rating || 0) / 5;
  const records = game.records_made || 0;
  const confidence = Math.log(1 + records) / 3;
  return rating * confidence;
}

function cosineVector(gameVector, baseVector) {
  return baseVector.map((v) => (gameVector.has(v) ? 1 : 0));
}

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

    console.log(userGames);
    let userGenres = new Set();
    let userThemes = new Set();
    let userKeywords = new Set();
    let relevantGenres = new Set();
    let relevantThemes = new Set();
    let relevantKeywords = new Set();
    let gameArray = Array.from(userGames);
    let userThemeVector = new Array(themeVector.length).fill(0);
    let userGenreVector = new Array(genreVector.length).fill(0);

    let keywordVector = new Set();
    user.games_played.forEach((game) => {
      const keywordList = game.game_id.keywords || [];
      keywordList.forEach((keyword) => {
        keywordVector.add(keyword.name);
      });
    });
    keywordVector = Array.from(keywordVector);
    let userKeywordVector = new Array(keywordVector.length).fill(0);
    for (let gameData of user.games_played) {
      console.log(gameData);
      if (gameData) {
        console.log("indeed");
        let favouriteBias = 1;
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
        console.log(rating, playCount, hoursPlayed, favouriteBias);
        gameData.game_id?.genres.forEach((genre) => {
          const genreIndex = genreVector.indexOf(genre.name);
          console.log(genreIndex);
          if (genreIndex !== -1) {
            userGenreVector[genreIndex] +=
              (rating / 5) *
              Math.sqrt(hoursPlayed) *
              (Math.log2(playCount) + 1) *
              favouriteBias;
          }
        });

        gameData.game_id?.themes.forEach((theme) => {
          const themeIndex = themeVector.indexOf(theme.name);
          if (themeIndex !== -1) {
            userThemeVector[themeIndex] +=
              (rating / 5) *
              Math.sqrt(hoursPlayed) *
              (Math.log2(playCount) + 1) *
              favouriteBias;
          }
        });

        gameData.game_id?.keywords.forEach((keyword) => {
          const keywordIndex = keywordVector.indexOf(keyword.name);
          if (keywordIndex !== -1) {
            userKeywordVector[keywordIndex] +=
              (rating / 5) *
              Math.sqrt(hoursPlayed) *
              (Math.log2(playCount) + 1) *
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
      }
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
    let recommendations = [];
    for (let game of relevantGames) {
      if (userGames.has(game._id.toString())) continue;
      let gameGenres = cosineVector(
        new Set((game?.genres ?? []).map((genre) => genre.name)),
        genreVector
      );
      let gameThemes = cosineVector(
        new Set((game?.themes ?? []).map((theme) => theme.name)),
        themeVector
      );
      let gameKeywords = cosineVector(
        new Set((game?.keywords ?? []).map((keyword) => keyword.name)),
        keywordVector
      );
      let genreScore = similarity(userGenreVector, gameGenres);
      let themeScore = similarity(userThemeVector, gameThemes);
      let keywordScore = similarity(userKeywordVector, gameKeywords);
      let finalScore =
        0.35 * (genreScore || 0) +
        0.35 * (themeScore || 0) +
        0.2 * (keywordScore || 0) +
        0.1 * confidenceScore(game);
      recommendations.push({ game, finalScore });
    }
    recommendations.sort((a, b) => b.finalScore - a.finalScore);

    return recommendations.slice(0, 50);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
}
