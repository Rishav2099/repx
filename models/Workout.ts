import mongoose, { Schema } from "mongoose";

const workoutSchema: Schema = new Schema(
  {
    workoutName: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    exercises: [
      {
        name: {
          type: String,
          required: true,
        },
        reps: {
          type: Number,
        },
        sets: {
          type: Number,
        },
        time: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Workout ||
  mongoose.model("Workout", workoutSchema);
