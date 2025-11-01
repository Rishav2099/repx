import mongoose, { Schema } from "mongoose";

const friendSchema = new Schema(
  {
    // user who send the friend request
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    //user who received the friend request
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // status of friend request
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
    },

    challenges: [
      {
        type: Schema.Types.ObjectId,
        ref: "Challenge",
      },
    ],
  },
  { timestamps: true }
);

friendSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.models.Friend || mongoose.model("Friend", friendSchema);
