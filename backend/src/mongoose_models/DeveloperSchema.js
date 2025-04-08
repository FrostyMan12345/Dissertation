const mongoose = require("mongoose");

const devSchema = new mongoose.Schema(
  {
    username: { type: String },
    password: { type: String },
    image: { type: String },
    dev_comments: {
      developer_id: { type: String },
      comment: { type: String },
      likes: { typoe: Number },
      dislikes: { type: Number },
      created: { type: String },
    },
  },
  { collection: "Developer" }
);

const Developer = mongoose.model("Developer", devSchema);

module.exports = Developer;
