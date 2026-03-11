import React, { useState, useEffect } from 'react';
import './DevoteeTodoList.css';

const API_BASE = process.env.REACT_APP_API_BASE;
const DevoteeTodoList = ({ setView }) => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const userId = localStorage.getItem('userId');

  // Fetch todos from backend
  useEffect(() => {
    async function fetchTodos() {
      const response = await fetch(`${API_BASE}/api/todos?user_id=${userId}`);
      const data = await response.json();
      setTodos(data);
    }
    fetchTodos();
  }, [userId]);

  // Add new todo
  const handleAddTodo = async () => {
    if (input.trim()) {
      const todo_date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      await fetch(`${API_BASE}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, todo_text: input, todo_date })
      });
      // Fetch updated todos after adding
      const response = await fetch(`${API_BASE}/api/todos?user_id=${userId}`);
      const data = await response.json();
      setTodos(data);
      setInput('');
    }
  };

  // Toggle completed status
  const handleToggleTodo = async (todo) => {
    await fetch(`${API_BASE}/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed })
    });
    // Fetch updated todos after toggling
    const response = await fetch(`${API_BASE}/api/todos?user_id=${userId}`);
    const data = await response.json();
    setTodos(data);
  };

  // Delete todo
  const handleDeleteTodo = async (todo) => {
    await fetch(`${API_BASE}/api/todos/${todo.id}`, {
      method: 'DELETE'
    });
    setTodos(todos.filter((t) => t.id !== todo.id));
  };

  const workTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  return (
    <div className="todo-container">
      {/* Info banner for first-time users */}
      <div className="todo-info-banner">
        <span>
          If you are a first-time user,
          <a
            href="#"
            className="todo-help-link"
            onClick={e => {
              e.preventDefault();
              window.scrollTo(0,0);
              if (setView) setView('helpGuide');
            }}
          >
            visit the <b>Help Page</b>
          </a> for guidance.
        </span>
      </div>
      <h2 className="todo-title">Devotee Daily Todo List</h2>
      <div className="todo-input-section">
        <input
          className="todo-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add your task..."
          onKeyDown={e => {
            if (e.key === 'Enter') handleAddTodo();
          }}
        />
        <button className="todo-add-btn" onClick={handleAddTodo}>Add</button>
      </div>
      <div className="todo-section">
        <h3>Work Need to be Done</h3>
        <ul className="todo-list">
          {workTodos.length === 0 && <li className="todo-empty">No pending tasks!</li>}
          {workTodos.map((todo) => (
            <li key={todo.id} className="todo-item">
              <div className="todo-row">
                <span className="todo-text">{todo.todo_text}</span>
                <button className="todo-done-btn theme-btn green-btn" onClick={() => handleToggleTodo(todo)} aria-label="Mark Done">
                  <i className="bi bi-check2-circle"></i>
                </button>
                <button className="todo-undo-btn theme-btn red-btn" onClick={() => handleDeleteTodo(todo)} aria-label="Delete">
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="todo-section completed">
        <h3>Completed Work</h3>
        <ul className="todo-list">
          {completedTodos.length === 0 && <li className="todo-empty">No completed tasks yet!</li>}
          {completedTodos.map((todo) => (
            <li key={todo.id} className="todo-item completed">
              <div className="todo-row">
                <span className="todo-text">{todo.todo_text}</span>
                <button className="todo-undo-btn theme-btn green-btn" onClick={() => handleToggleTodo(todo)} aria-label="Undo">
                  <i className="bi bi-arrow-counterclockwise"></i>
                </button>
                <button className="todo-undo-btn theme-btn red-btn" onClick={() => handleDeleteTodo(todo)} aria-label="Delete">
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DevoteeTodoList;
