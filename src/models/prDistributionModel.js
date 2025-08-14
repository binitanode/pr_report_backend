const mongoose = require("mongoose");

const MySchema = new mongoose.Schema(
  {
    exchange_symbol: {
      type: String,
    },
    recipient: {
      type: String,
    },
    url: {
      type: String,
    },
    potential_reach: {
      type: Number,
    },
    about: {
      type: String,
    },
    value: {
      type: String,
    },
    report_title: {
      type: String,
    },
    grid_id: {
      type: String,
    },
    soft_delete: {
      type: Boolean,
      default: false,
    },
    uploaded_by: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
      email: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const PrDistribution = mongoose.model("pr_distribution", MySchema);

module.exports = PrDistribution;
