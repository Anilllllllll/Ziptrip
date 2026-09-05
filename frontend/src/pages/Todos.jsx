import React, { useState, useEffect } from 'react';
import TodoForm from '../components/TodoForm';
import TodoItem from '../components/TodoItem';

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

function Todos() {
  // Load initial state instantly from cache if available (0ms load time!)
  const [todos, setTodos] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => {
    // Only show full loading if we have no cached todos
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });

  const [isWakingUp, setIsWakingUp] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [notification, setNotification] = useState(null); // { message, type }

  // Helper to trigger temporary alert notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((current) => (current && current.message === message ? null : current));
    }, 3000);
  };

  // Helper to save todos to cache
  const updateLocalCache = (data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      // Ignore storage errors
    }
  };

  // Fetch all todos from the backend API
  const fetchTodos = async (isInitial = false) => {
    // Timer to detect if Render free-tier server is in a cold start (>2.5s)
    let wakeupTimer = setTimeout(() => {
      setIsWakingUp(true);
    }, 2500);

    try {
      if (isInitial && todos.length === 0) {
        setLoading(true);
      }
      setError(null);
      const response = await fetch(API_URL);

      clearTimeout(wakeupTimer);
      setIsWakingUp(false);

      if (!response.ok) {
        throw new Error('Failed to load todos.');
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setTodos(data);
        updateLocalCache(data);
      }
    } catch (err) {
      clearTimeout(wakeupTimer);
      setIsWakingUp(false);
      // Only show blocking error if no cached data exists
      if (todos.length === 0) {
        setError('Failed to load todos from server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos(true);
  }, []);

  // Create a new todo with 0ms instant optimistic UI update
  const handleCreateTodo = async (newTodoData) => {
    // Generate an immediate local optimistic todo
    const tempId = Date.now();
    const optimisticTodo = {
      id: tempId,
      title: newTodoData.title,
      description: newTodoData.description || '',
      completed: false,
      createdAt: new Date().toISOString()
    };

    // 1. Instantly update UI and localStorage
    setTodos((prevTodos) => {
      const list = Array.isArray(prevTodos) ? prevTodos : [];
      const next = [...list, optimisticTodo];
      updateLocalCache(next);
      return next;
    });
    showNotification('Todo created successfully!', 'success');

    // 2. Persist to server in background
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTodoData)
      });

      if (!response.ok) {
        throw new Error('Failed to create todo on server');
      }

      const createdTodo = await response.json();
      if (createdTodo && createdTodo.id) {
        // Replace tempId with server ID
        setTodos((prevTodos) => {
          const list = Array.isArray(prevTodos) ? prevTodos : [];
          const synced = list.map((t) => (t.id === tempId ? createdTodo : t));
          updateLocalCache(synced);
          return synced;
        });
      }
    } catch (err) {
      console.warn('Backend sync failed, saved in local cache:', err);
    }
  };

  // Toggle todo completed status (Complete / Undo)
  const handleToggleComplete = async (id, currentCompleted) => {
    // Optimistic UI update for instant response
    setTodos((prevTodos) => {
      const updated = (Array.isArray(prevTodos) ? prevTodos : []).map((todo) =>
        todo.id === id ? { ...todo, completed: !currentCompleted } : todo
      );
      updateLocalCache(updated);
      return updated;
    });

    if (!currentCompleted) {
      showNotification('Todo marked as completed!', 'success');
    } else {
      showNotification('Todo marked as active!', 'info');
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: !currentCompleted })
      });

      if (!response.ok) {
        throw new Error('Failed to update on server');
      }

      const serverUpdated = await response.json();
      setTodos((prevTodos) => {
        const synced = (Array.isArray(prevTodos) ? prevTodos : []).map((todo) =>
          todo.id === id ? serverUpdated : todo
        );
        updateLocalCache(synced);
        return synced;
      });
    } catch (err) {
      // Revert if server update failed
      setTodos((prevTodos) => {
        const reverted = (Array.isArray(prevTodos) ? prevTodos : []).map((todo) =>
          todo.id === id ? { ...todo, completed: currentCompleted } : todo
        );
        updateLocalCache(reverted);
        return reverted;
      });
      alert('Error updating todo status on server.');
    }
  };

  // Update a todo title & description with 0ms optimistic UI update
  const handleUpdateTodo = async (id, updatedFields) => {
    const previousTodos = todos;

    // 1. Instant optimistic update
    setTodos((prevTodos) => {
      const list = Array.isArray(prevTodos) ? prevTodos : [];
      const updated = list.map((todo) =>
        todo.id === id ? { ...todo, ...updatedFields, updatedAt: new Date().toISOString() } : todo
      );
      updateLocalCache(updated);
      return updated;
    });
    showNotification('Todo updated successfully!', 'success');

    // 2. Sync to server in background
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedFields)
      });

      if (!response.ok) {
        throw new Error('Failed to update todo on server');
      }

      const serverUpdated = await response.json();
      setTodos((prevTodos) => {
        const list = Array.isArray(prevTodos) ? prevTodos : [];
        const synced = list.map((todo) => (todo.id === id ? serverUpdated : todo));
        updateLocalCache(synced);
        return synced;
      });
    } catch (err) {
      // Revert if server update failed
      setTodos(previousTodos);
      updateLocalCache(previousTodos);
      alert('Error updating todo on server.');
    }
  };

  // Delete a todo with browser confirmation
  const handleDeleteTodo = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this todo?');
    if (!confirmed) return;

    // Optimistic deletion for instant UI
    const previousTodos = todos;
    setTodos((prevTodos) => {
      const filtered = (Array.isArray(prevTodos) ? prevTodos : []).filter((todo) => todo.id !== id);
      updateLocalCache(filtered);
      return filtered;
    });
    showNotification('Todo deleted successfully!', 'danger');

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete on server');
      }
    } catch (err) {
      // Revert on error
      setTodos(previousTodos);
      updateLocalCache(previousTodos);
      alert('Error deleting todo on server.');
    }
  };

  const todoList = Array.isArray(todos) ? todos : [];

  // Frontend filtering logic
  const filteredTodos = todoList.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; // 'all'
  });

  return (
    <div className="todos-page">
      <header className="page-header">
        <div className="header-brand">
          <img src="/logo.png" alt="Ziptrip Logo" className="brand-logo" />
          <h1>Ziptrip Todo Application</h1>
        </div>
        <p className="page-subtitle">Organize and track your daily tasks</p>
      </header>

      {/* Action Notification Alert */}
      {notification && (
        <div className={`notification-toast toast-${notification.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {notification.type === 'success' ? '✓' : notification.type === 'danger' ? '✕' : 'ℹ'}
            </span>
            <span className="toast-text">{notification.message}</span>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => setNotification(null)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {/* Cold Start Server Status Alert */}
      {isWakingUp && (
        <div className="server-status-banner">
          <span className="spinner-dot"></span>
          <span>Connecting to free server (waking up, please hold on ~20s)...</span>
        </div>
      )}

      {/* Todo Creation Form */}
      <section className="card form-card">
        <TodoForm onSubmit={handleCreateTodo} />
      </section>

      {/* Filter Tabs */}
      <div className="filters-container">
        <button
          type="button"
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({todoList.length})
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({todoList.filter((t) => !t.completed).length})
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({todoList.filter((t) => t.completed).length})
        </button>
      </div>

      {/* Loading State (Only if no cached data) */}
      {loading && todos.length === 0 && (
        <div className="state-message">
          <p>Loading todos...</p>
        </div>
      )}

      {/* Error State */}
      {error && todos.length === 0 && (
        <div className="state-message error-state">
          <p>{error}</p>
          <button type="button" className="btn btn-secondary" onClick={() => fetchTodos(true)}>
            Retry
          </button>
        </div>
      )}

      {/* Todo Items List */}
      {(!loading || todos.length > 0) && (
        <div className="todos-list">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <p>No todos found.</p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleComplete}
                onEdit={handleUpdateTodo}
                onDelete={handleDeleteTodo}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Todos;
