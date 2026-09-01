const express = require('express');
const router = express.Router();
const {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
} = require('../controllers/todoController');

// GET all todos & POST a new todo
router.route('/')
  .get(getAllTodos)
  .post(createTodo);

// GET, PUT, DELETE single todo by ID
router.route('/:id')
  .get(getTodoById)
  .put(updateTodo)
  .delete(deleteTodo);

module.exports = router;
