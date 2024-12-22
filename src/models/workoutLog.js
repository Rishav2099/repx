import mongoose from "mongoose";

const workoutLogSchema = new mongoose.Schema({
    workoutName: {
        type: String,
        required: true
    },
    countOfExercise: {
        type: Number,
        default: 0
    },
    exercises: [
        {
            exerciseName: {
                type: String,
                required: true
            },
            duration: {
                type: Object,
                required: true,
                validate: {
                    validator: function (value) {
                        if (typeof value !== 'object' || Array.isArray(value)) return false;
                        return (
                            (value.time && typeof value.time === 'number') ||
                            (value.reps && typeof value.reps === 'number')
                        );
                    },
                    message: 'duration must be in time or reps'
                }
            }
        }
    ],
    totalTime: {
        type: String, // Store total time as a string in MM:SS format
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to format totalTime before saving
workoutLogSchema.pre('save', function (next) {
    if (typeof this.totalTime === 'number') {
        const minutes = Math.floor(this.totalTime / 60);
        const seconds = this.totalTime % 60;
        this.totalTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    this.countOfExercise = this.exercises.length;
    next();
});

const WorkoutLog = mongoose.models.WorkoutLog || mongoose.model('WorkoutLog', workoutLogSchema);
export default WorkoutLog;
