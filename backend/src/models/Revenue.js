import mongoose from "mongoose";

const revenueDaySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  day: {
    type: String,
    required: true,
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  posRevenue: {
    type: Number,
    required: true,
    default: 0,
  },
  eatclubRevenue: {
    type: Number,
    required: true,
    default: 0,
  },
  labourCosts: {
    type: Number,
    required: true,
    default: 0,
  },
  totalCovers: {
    type: Number,
    required: true,
    default: 0,
  },
  positiveEventImpact: {
    type: Number,
    default: 0,
  },
  negativeEventImpact: {
    type: Number,
    default: 0,
  },
});

const revenueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    periodType: {
      type: String,
      enum: ["current", "previous"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalRevenue: {
      type: Number,
      required: true,
      default: 0,
    },
    averagePerDay: {
      type: Number,
      required: true,
      default: 0,
    },
    totalCovers: {
      type: Number,
      required: true,
      default: 0,
    },
    days: [revenueDaySchema],
    isProcessed: {
      type: Boolean,
      default: false,
    },
    dataSource: {
      type: String,
      enum: ["pos", "eatclub", "manual"],
      default: "pos"
    }
  },
  {
    timestamps: true,
  }
);

const Revenue = mongoose.model("Revenue", revenueSchema);
export default Revenue;