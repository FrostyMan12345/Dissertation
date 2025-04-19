const mongoose = require("mongoose");

const devSchema = new mongoose.Schema(
  {
    username: { type: String },
    password: { type: String },
    image: { type: String },
    dev_comments: [
      {
        game_id: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
        comment_id: { type: mongoose.Schema.Types.ObjectId },
        created: { type: Number },
        edited: { type: Number, defualt: 0 },
      },
    ],
    verified: { type: Boolean, default: false },
    request: { type: String, default: "" },
    companies: [{ type: String }],
  },
  { collection: "Developer" }
);

const Developer = mongoose.model("Developer", devSchema);

module.exports = Developer;
