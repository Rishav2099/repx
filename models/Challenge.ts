import mongoose, { Schema } from "mongoose";

const challengeSchema = new Schema(
  {
    challengeName: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    // wheter other user has accepted this challenge or not
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },

    challenger: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    challengee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reps: {
      type: Number,
      required: true,
      min: 1,
    },

    forDays: {
      type: Number,
      required: true,
      min: 1,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    progress: {
      challenger: [{ type: Date }],
      challengee: [{ type: Date }],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Challenge ||
  mongoose.model("Challenge", challengeSchema);
