const mongoose = require("mongoose");

const devSchema = new mongoose.Schema(
  {
    username: { type: String },
    password: { type: String },
    image: { type: String },
    dev_comments: {
      game_id: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
      // comment: { type: String },
      // likes: { type: Number },
      // dislikes: { type: Number },
      comment_id: { type: mongoose.Schema.Types.ObjectId },
      // created: { type: String },
    },
  },
  { collection: "Developer" }
);

const Developer = mongoose.model("Developer", devSchema);

module.exports = Developer;
