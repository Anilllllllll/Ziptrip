import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

// Normalize API URL to handle with or without /api/todos or trailing slashes
const getApiUrl = () => {
  let raw = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/todos';
  raw = raw.trim().replace(/\/+$/, '');
  if (!raw.endsWith('/api/todos')) {
    if (raw.endsWith('/api')) {
      raw = `${raw}/todos`;
    } else {
      raw = `${raw}/api/todos`;
    }
  }
  return raw;
};

const API_URL = getApiUrl();
const CACHE_KEY = 'ziptrip_todos_cache';

function TodoDetails() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  // Load from cache initially for instant display
  const [todo, setTodo] = useState(() => {
    if (!id) return null;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const list = JSON.parse(cached);
        const match = Array.isArray(list) ? list.find((t) => String(t.id) === String(id)) : null;
        return match || null;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    if (!id) return false;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const list = JSON.parse(cached);
        const match = Array.isArray(list) ? list.find((t) => String(t.id) === String(id)) : null;
        return !match;
      }
      return true;
    } catch {
      return true;
    }
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    // If no ID query parameter was provided
    if (!id) {
      setError('Todo not found.');
      setLoading(false);
      return;
    }

    const fetchTodoDetails = async () => {
      try {
        if (!todo) setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
          throw new Error('Todo not found.');
        }

        const data = await response.json();
        if (data && typeof data === 'object' && !data.message) {
          setTodo(data);
        } else {
          throw new Error('Todo not found.');
        }
      } catch (err) {
        if (!todo) {
          setError('Todo not found.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTodoDetails();
  }, [id]);

  // Format date helper (e.g. September 1, 2026)
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((current) => (current && current.message === message ? null : current));
    }, 3000);
  };

  const handleStartEdit = () => {
    if (todo) {
      setEditTitle(todo.title || '');
      setEditDescription(todo.description || '');
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    if (todo) {
      setEditTitle(todo.title || '');
      setEditDescription(todo.description || '');
    }
    setIsEditing(false);
  };

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    if (!editTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }

    const updatedData = {
      title: editTitle.trim(),
      description: editDescription.trim()
    };

    // 1. Optimistic local update
    const updatedTodo = {
      ...todo,
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    setTodo(updatedTodo);
    setIsEditing(false);
    showNotification('Todo updated successfully!', 'success');

    // Update localStorage cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const list = JSON.parse(cached);
        const nextList = list.map((t) => (String(t.id) === String(id) ? updatedTodo : t));
        localStorage.setItem(CACHE_KEY, JSON.stringify(nextList));
      }
    } catch (e) {}

    // 2. Persist to server
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Failed to update todo on server');
      }

      const serverData = await response.json();
      setTodo(serverData);
    } catch (err) {
      console.warn('Server sync error on details edit:', err);
    }
  };

  return (
    <div className="todo-details-page">
      <header className="page-header">
        <div className="header-brand">
          <img src="/logo.png" alt="Ziptrip Logo" className="brand-logo" />
          <h1>Ziptrip Todo Details</h1>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast toast-${notification.type}`}>
          <div className="toast-content">
            <span className="toast-icon">✓</span>
            <span className="toast-text">{notification.message}</span>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !todo && <div className="state-message">Loading todo...</div>}

      {/* Error / Not Found State */}
      {error && !loading && !todo && (
        <div className="card state-message error-state">
          <p>{error}</p>
          <Link to="/todos" className="btn btn-secondary">
            Back to Todos
          </Link>
        </div>
      )}

      {/* Todo Details Card */}
      {todo && !isEditing && (
        <div className="card details-card">
          <div className="detail-field">
            <span className="detail-label">Title</span>
            <h2 className="detail-title">{todo.title}</h2>
          </div>

          <div className="detail-field">
            <span className="detail-label">Description</span>
            <p className="detail-description">
              {todo.description || 'No description provided.'}
            </p>
          </div>

          <div className="detail-row">
            <div className="detail-field">
              <span className="detail-label">Status</span>
              <span
                className={`status-badge ${
                  todo.completed ? 'badge-completed' : 'badge-active'
                }`}
              >
                {todo.completed ? 'Completed' : 'Active'}
              </span>
            </div>

            <div className="detail-field">
              <span className="detail-label">Created</span>
              <span className="detail-date">{formatDate(todo.createdAt)}</span>
            </div>
          </div>

          <div className="details-actions">
            <button
              type="button"
              className="btn btn-edit"
              onClick={handleStartEdit}
            >
              Edit Task
            </button>
            <Link to="/todos" className="btn btn-secondary">
              Back to Todos
            </Link>
          </div>
        </div>
      )}

      {/* Todo Edit Card */}
      {todo && isEditing && (
        <div className="card details-card todo-card-editing">
          <form onSubmit={handleSaveEdit} className="todo-edit-form">
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
                rows={3}
              />
            </div>

            <div className="todo-edit-actions">
              <button type="submit" className="btn btn-save">
                Save Changes
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default TodoDetails;
