import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const isCompleted = todo.completed;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title || '');
  const [editDescription, setEditDescription] = useState(todo.description || '');

  const handleStartEdit = () => {
    setEditTitle(todo.title || '');
    setEditDescription(todo.description || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title || '');
    setEditDescription(todo.description || '');
    setIsEditing(false);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!editTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }
    if (onEdit) {
      onEdit(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim()
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (isEditing) {
    return (
      <div className="todo-card todo-card-editing">
        <form onSubmit={handleSave} className="todo-edit-form" onKeyDown={handleKeyDown}>
          <div className="edit-form-group">
            <label className="edit-label">Title</label>
            <input
              type="text"
              className="todo-edit-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Todo title..."
              autoFocus
              required
            />
          </div>

          <div className="edit-form-group">
            <label className="edit-label">Description</label>
            <textarea
              className="todo-edit-textarea"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description (optional)..."
              rows={2}
            />
          </div>

          <div className="todo-edit-actions">
            <button type="submit" className="btn btn-save">
              Save
            </button>
            <button type="button" className="btn btn-cancel" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

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
          className="btn btn-edit"
          onClick={handleStartEdit}
          title="Edit this task"
        >
          Edit
        </button>

        <button
          type="button"
          className="btn btn-delete"
          onClick={() => onDelete(todo.id)}
          title="Delete this task"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default TodoItem;

