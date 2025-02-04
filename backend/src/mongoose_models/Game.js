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
  },
  { collection: "Games" }
);

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
