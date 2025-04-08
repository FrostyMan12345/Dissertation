const mongoose = require("mongoose");
const User = require("./UserSchema");
const Admin = require("./AdminSchema");

const gameSchema = new mongoose.Schema(
  {
    name: { type: String },
    first_release_date: { type: String },
    platforms: [{ type: Object }],
    genres: [{ type: Object }],
    themes: [{ type: Object }],
    id: { type: Number },
    cover: { type: Object },
    summary: { type: String },
    expanded_games: [String],
    ports: [{ type: Object }],
    keywords: [{ type: Object }],
    age_ratings: [String],
    involved_companies: [String],
    average_rating: { type: Number },
    average_times_played: { type: Number },
    average_hours_played: { type: Number },
    records_made: { type: Number },
    played_by: [
      {
        user_id: { type: mongoose.Schema.Types.ObjectId, refPath: "user_type" },
        // user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        user_type: { type: String, enum: ["User", "Admin"] },
        rating: { type: Number },
        hours_played: { type: Number },
        times_played: { type: Number },
        edited: { type: Boolean },
        review: {
          type: {
            username: { type: String },
            review_content: { type: String },
            likes: { type: Number },
            dislikes: { type: Number },
            created: { type: Number },
            edited: { type: Number, required: false },
            review_id: { type: mongoose.Schema.Types.ObjectId },
            reactions: {
              type: [
                {
                  user_id: { type: mongoose.Schema.Types.ObjectId },
                  reaction: { type: Number },
                },
              ],
            },
          },
          required: false,
        },
      },
    ],
  },
  { collection: "Games" }
);

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
