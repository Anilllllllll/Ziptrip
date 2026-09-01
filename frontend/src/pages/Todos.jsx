import React, { useState, useEffect } from 'react';
import TodoForm from '../components/TodoForm';
import TodoItem from '../components/TodoItem';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/todos';

function Todos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  // Fetch all todos from the backend API
  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Failed to load todos.');
      }

      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError('Failed to load todos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Create a new todo
  const handleCreateTodo = async (newTodoData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTodoData)
      });

      if (!response.ok) {
        throw new Error('Failed to create todo');
      }

      const createdTodo = await response.json();
      setTodos((prevTodos) => [...prevTodos, createdTodo]);
    } catch (err) {
      alert('Error creating todo. Please try again.');
    }
  };

  // Toggle todo completed status (Complete / Undo)
  const handleToggleComplete = async (id, currentCompleted) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: !currentCompleted })
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      const updatedTodo = await response.json();
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
    } catch (err) {
      alert('Error updating todo. Please try again.');
    }
  };

  // Delete a todo with browser confirmation
  const handleDeleteTodo = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this todo?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } catch (err) {
      alert('Error deleting todo. Please try again.');
    }
  };

  // Frontend filtering logic
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; // 'all'
  });

  return (
    <div className="todos-page">
      <header className="page-header">
        <h1>My Todos</h1>
        <p className="page-subtitle">Organize and track your daily tasks</p>
      </header>

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
          All ({todos.length})
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({todos.filter((t) => !t.completed).length})
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({todos.filter((t) => t.completed).length})
        </button>
      </div>

      {/* Loading & Error States */}
      {loading && <div className="state-message">Loading todos...</div>}

      {error && !loading && (
        <div className="state-message error-state">
          <p>{error}</p>
          <button type="button" className="btn btn-secondary" onClick={fetchTodos}>
            Retry
          </button>
        </div>
      )}

      {/* Todo Items List */}
      {!loading && !error && (
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
