const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    password: { type: String },
    image: { type: String },
    games_played: [
      {
        game_id: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
        rating: { type: Number },
        hours_played: { type: Number },
        times_played: { type: Number },
        review: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Games.played_by.review.review_id",
        },
      },
    ],
  },
  { collection: "Users" }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
