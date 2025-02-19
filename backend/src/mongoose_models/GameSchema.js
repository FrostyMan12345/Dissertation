const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    name: { type: String },
    first_release_date: { type: String },
    platforms: [String],
    genres: [String],
    id: { type: Number },
    cover: { type: Number },
    summary: { type: String },
    expanded_games: [String],
    ports: [String],
    keywords: [String],
    age_ratings: [String],
    involved_companies: [String],
    played_by: [
      {
        // user_id: { type: mongoose.Schema.Types.ObjectId, refPath: "user_type" },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        user_type: { type: String, enum: ["User", "Admin"] },
        rating: { type: Number },
        hours_played: { type: Number },
        times_played: { type: Number },
        edited: { type: Boolean },
        review: { type: Object, required: false },
      },
    ],
  },
  { collection: "Games" }
);

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
