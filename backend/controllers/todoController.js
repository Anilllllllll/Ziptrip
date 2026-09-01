const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/todos.json');

// Helper function to read todos from JSON file
const readTodosFromFile = () => {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf-8');
    return [];
  }
  const fileData = fs.readFileSync(dataFilePath, 'utf-8');
  try {
    return JSON.parse(fileData);
  } catch (error) {
    return [];
  }
};

// Helper function to write todos to JSON file
const writeTodosToFile = (todos) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(todos, null, 2), 'utf-8');
};

// GET /api/todos - Get all todos
const getAllTodos = (req, res) => {
  try {
    const todos = readTodosFromFile();
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/todos/:id - Get a single todo by ID
const getTodoById = (req, res) => {
  try {
    const todoId = parseInt(req.params.id, 10);
    if (isNaN(todoId)) {
      return res.status(400).json({ message: 'Invalid Todo ID format' });
    }

    const todos = readTodosFromFile();
    const todo = todos.find((t) => t.id === todoId);

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/todos - Create a new todo
const createTodo = (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    const todos = readTodosFromFile();

    // Generate unique auto-incrementing ID
    const nextId = todos.length > 0 ? Math.max(...todos.map((t) => t.id || 0)) + 1 : 1;

    const newTodo = {
      id: nextId,
      title: title.trim(),
      description: description && typeof description === 'string' ? description.trim() : '',
      completed: false,
      createdAt: new Date().toISOString()
    };

    todos.push(newTodo);
    writeTodosToFile(todos);

    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/todos/:id - Update an existing todo
const updateTodo = (req, res) => {
  try {
    const todoId = parseInt(req.params.id, 10);
    if (isNaN(todoId)) {
      return res.status(400).json({ message: 'Invalid Todo ID format' });
    }

    const todos = readTodosFromFile();
    const todoIndex = todos.findIndex((t) => t.id === todoId);

    if (todoIndex === -1) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const existingTodo = todos[todoIndex];
    const { title, description, completed } = req.body;

    // Update fields if provided in request body
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ message: 'Title cannot be empty' });
      }
      existingTodo.title = title.trim();
    }

    if (description !== undefined) {
      existingTodo.description = typeof description === 'string' ? description.trim() : '';
    }

    if (completed !== undefined) {
      existingTodo.completed = Boolean(completed);
    }

    todos[todoIndex] = existingTodo;
    writeTodosToFile(todos);

    res.status(200).json(existingTodo);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/todos/:id - Delete a todo by ID
const deleteTodo = (req, res) => {
  try {
    const todoId = parseInt(req.params.id, 10);
    if (isNaN(todoId)) {
      return res.status(400).json({ message: 'Invalid Todo ID format' });
    }

    const todos = readTodosFromFile();
    const todoIndex = todos.findIndex((t) => t.id === todoId);

    if (todoIndex === -1) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    todos.splice(todoIndex, 1);
    writeTodosToFile(todos);

    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
};
