import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    countOfExercise: {
        type: Number,
        default: 0
    },
    exercises: [
       {
        exercise:  {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise'
        }, //
        duration: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            validate: {
                validator: function (value) {
                    // ensure either time or reps is selected
                    if (typeof value !== 'object' || Array.isArray(value)) return false;
                    return (
                        (value.time && typeof value.time === 'number') ||
                        (value.reps && typeof value.reps === 'number')
                    )
                }, 
                message: 'Duration must be in time or reps'
            }
        }
       }
    ],
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

//middelware to automatically update count of exercie based on the length of exercise array
workoutSchema.pre('save', function (next) {
    this.countOfExercise = this.exercises.length;
    next()
})

const Workout = mongoose.models.Workout || mongoose.model('Workout', workoutSchema);
export default Workout;