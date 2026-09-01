import React, { useState } from 'react';

function TodoForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a todo title');
      return;
    }

    setError('');
    onSubmit({
      title: title.trim(),
      description: description.trim()
    });

    // Clear form inputs
    setTitle('');
    setDescription('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="todo-title">Title</label>
        <input
          id="todo-title"
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="todo-description">Description</label>
        <textarea
          id="todo-description"
          placeholder="Add some details (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-textarea"
          rows={3}
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn btn-primary btn-add">
        Add Todo
      </button>
    </form>
  );
}

export default TodoForm;
