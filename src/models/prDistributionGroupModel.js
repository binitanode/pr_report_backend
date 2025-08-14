const { Schema, model } = require("mongoose");

const MySchema = new Schema(
  {
    grid_id: { type: String, required: true },
    report_title: { type: String },
    uploaded_by: {
      id: String,
      name: String,
      email: String,
    },
    total_records: { type: Number },
    overallPotentialReach: { type: Number },
    distribution_data: { type: Array, default: [] },  
    status: { type: String, default: "Pending" },  
    soft_delete: {
      type: Boolean,
      default: false,
    },
    sharedEmails: {
      type: Array,
      default: [],
    },
    is_private: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
const PrDistributionGroup = model("pr_distribution_group", MySchema);

module.exports = PrDistributionGroup;
