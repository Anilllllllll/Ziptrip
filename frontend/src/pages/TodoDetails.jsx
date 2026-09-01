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

function TodoDetails() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
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
        setLoading(true);
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
        setError('Todo not found.');
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

  return (
    <div className="todo-details-page">
      <header className="page-header">
        <h1>Todo Details</h1>
      </header>

      {/* Loading State */}
      {loading && <div className="state-message">Loading todo...</div>}

      {/* Error / Not Found State */}
      {error && !loading && (
        <div className="card state-message error-state">
          <p>{error}</p>
          <Link to="/todos" className="btn btn-secondary">
            Back to Todos
          </Link>
        </div>
      )}

      {/* Todo Details Card */}
      {!loading && !error && todo && (
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
            <Link to="/todos" className="btn btn-secondary">
              Back to Todos
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoDetails;
