import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    password: {
      type: String,
      select: false, // never return password in queries
    },
    email: { type: String, required: true },
    userName: { type: String },
    workouts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Workout",
      },
    ],
    doneWorkout: [
      {
        type: Schema.Types.ObjectId,
        ref: "DoneWorkout",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this as {
    password?: string;
    isModified: (field: string) => boolean;
  };

  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password!, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

export default mongoose.models.User || mongoose.model("User", userSchema);
