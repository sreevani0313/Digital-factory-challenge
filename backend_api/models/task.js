const mongoose = require("mongoose");

// Define the task schema
const taskSchema = mongoose.Schema({
  title: {
    type: String,
    required: true, // Ensure each task has a title
  },
  completed: {
    type: Boolean,
    default: false, // Default value for completed status is false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This references the 'User' model to associate a task with a user
    required: true, // Each task must be linked to a user
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Create the Task model from the schema
const Task = mongoose.model('Task', taskSchema);

// Export the Task model to be used in other parts of the application
module.exports = Task;
