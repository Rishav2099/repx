import mongoose from "mongoose";

const ExerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gif: { type: String },
    description: { type: String },
    muscleTargeted: {
        type: [String],
        enum: [
            "Chest",
            "Back",
            "Shoulders",
            "Biceps",
            "Triceps",
            "Legs",
            "Abs",
            "Glutes",
            "Hamstrings",
            "Quads",
            "Calves",
            "Forearms"
        ],
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    } // To differentiate between library exercises and custom exercises
})

export default mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema)