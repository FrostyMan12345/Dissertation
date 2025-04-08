const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: { type: String },
    password: { type: String },
    image: { type: String },
    favourite_games: {
      type: {
        first: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Game",
          required: false,
        },
        second: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Game",
          required: false,
        },
        third: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Game",
          required: false,
        },
      },
    },
    games_played: [
      {
        game_id: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
        rating: { type: Number },
        hours_played: { type: Number },
        times_played: { type: Number },
        review: { type: Object },
      },
    ],
  },
  { collection: "Admin" }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
