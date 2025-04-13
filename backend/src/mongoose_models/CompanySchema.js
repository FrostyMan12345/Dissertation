const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    id: { type: Number },
    name: { type: String },
    hasDeveloper: { type: Boolean, default: false },
  },
  { collection: "Companies" }
);

const Companies = mongoose.model("Companies", companySchema);

module.exports = Companies;
