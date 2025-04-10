import React, { useState, useEffect } from 'react';

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null); // track task being edited
  const [editedTaskText, setEditedTaskText] = useState(''); // store new text when editing

  useEffect(() => {
    // Load tasks from localStorage on component mount
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(savedTasks);
  }, []);

  const saveTasksToLocalStorage = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const addTask = (taskText) => {
    const newTask = { id: Date.now(), text: taskText, completed: false };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasksToLocalStorage(); // Save updated tasks to localStorage
    setNewTaskText('');
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    saveTasksToLocalStorage();
  };

  const toggleTaskCompletion = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    saveTasksToLocalStorage();
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id); // Set task to be edited
    setEditedTaskText(task.text); // Set current text for editing
  };

  const saveEditedTask = () => {
    const updatedTasks = tasks.map((task) =>
      task.id === editingTaskId ? { ...task, text: editedTaskText } : task
    );
    setTasks(updatedTasks);
    saveTasksToLocalStorage();
    setEditingTaskId(null); // Stop editing
    setEditedTaskText('');
  };

  const cancelEditing = () => {
    setEditingTaskId(null); // Cancel editing
    setEditedTaskText('');
  };

  return (
    <div>
      <h1>Welcome, User!</h1>
      <h2>This is your to-do list.</h2>
      <div>
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new task"
        />
        <button onClick={() => addTask(newTaskText)}>Add Task</button>
      </div>

      {tasks.length === 0 ? (
        <p>No tasks yet! Add a task to get started.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
              />
              {editingTaskId === task.id ? (
                <div>
                  <input
                    type="text"
                    value={editedTaskText}
                    onChange={(e) => setEditedTaskText(e.target.value)}
                  />
                  <button onClick={saveEditedTask}>Save</button> {/* Make sure saveEditedTask is called */}
                  <button onClick={cancelEditing}>Cancel</button> {/* Make sure cancelEditing is called */}
                </div>
              ) : (
                <>
                  <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.text}
                  </span>
                  <button onClick={() => startEditing(task)}>Edit</button> {/* Make sure startEditing is called */}
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoList;
