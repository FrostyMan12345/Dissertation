const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: { type: String },
    password: { type: String },
    games_played: [
      {
        game_id: { type: mongoose.Schema.Types.ObjectId, ref: "Games" },
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
