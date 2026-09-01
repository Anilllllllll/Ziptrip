import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Todos from './pages/Todos';
import TodoDetails from './pages/TodoDetails';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/todos" replace />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/todo" element={<TodoDetails />} />
        <Route path="*" element={<Navigate to="/todos" replace />} />
      </Routes>
    </div>
  );
}

export default App;
