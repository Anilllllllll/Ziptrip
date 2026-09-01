import React from 'react';
import { Link } from 'react-router-dom';

function TodoItem({ todo, onToggle, onDelete }) {
  const isCompleted = todo.completed;

  return (
    <div className={`todo-card ${isCompleted ? 'completed' : ''}`}>
      <div className="todo-content">
        <h3 className="todo-title">{todo.title}</h3>
        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}
        <div className="todo-meta">
          <span className={`status-badge ${isCompleted ? 'badge-completed' : 'badge-active'}`}>
            Status: {isCompleted ? 'Completed' : 'Active'}
          </span>
        </div>
      </div>

      <div className="todo-actions">
        <button
          type="button"
          className={`btn ${isCompleted ? 'btn-undo' : 'btn-complete'}`}
          onClick={() => onToggle(todo.id, todo.completed)}
        >
          {isCompleted ? 'Undo' : 'Complete'}
        </button>

        <Link
          to={`/todo?id=${todo.id}`}
          className="btn btn-view"
        >
          View
        </Link>

        <button
          type="button"
          className="btn btn-delete"
          onClick={() => onDelete(todo.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default TodoItem;
