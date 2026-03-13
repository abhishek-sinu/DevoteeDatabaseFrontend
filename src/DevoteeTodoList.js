import React, { useState, useEffect } from 'react';
import './DevoteeTodoList.css';

const API_BASE = process.env.REACT_APP_API_BASE;
const DevoteeTodoList = ({ setView, premiumExpiry }) => {
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

  // Restriction check
  const isPremiumValid = premiumExpiry && !isNaN(new Date(premiumExpiry)) && new Date(premiumExpiry) >= new Date();

  if (!isPremiumValid) {
    // Show restriction card if premium expired
    return (
      <div style={{margin:'40px auto',maxWidth:'500px'}}>
        <div className="card shadow-lg border-0 rounded-4 p-4" style={{ background: '#fff8f3' }}>
          <div className="text-center mb-3">
            <span style={{ fontSize: 48, color: '#c82333' }}><i className="bi bi-emoji-frown"></i></span>
            <h4 className="fw-bold mt-2" style={{ color: '#c82333' }}>Access Restricted</h4>
          </div>
          <div className="mb-3 text-center" style={{ fontSize: 18, color: '#7a4f01' }}>
            Sorry, your <b>trial pack</b> or <b>premium pack</b> has expired.<br />
            Please upgrade to continue enjoying all features!
          </div>
          <div className="mb-3 text-center" style={{ fontSize: 16, color: '#444' }}>
            <b>Upgrade for just ₹10/month</b> — this helps us maintain the website, domain, and devotee database.
          </div>
          <div className="alert alert-success d-flex align-items-center justify-content-between fw-bold mb-3" style={{ fontSize: 16, background: '#e6f4ea', color: '#256029', border: '1px solid #b7e0c7' }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 18, marginRight: 8 }}>😊</span> Don't worry, you can still continue entering your sadhana!
            </span>
            <button
              className="btn btn-outline-success btn-sm fw-bold ms-3"
              style={{ borderRadius: '8px', minWidth: 'auto', fontSize: '0.98rem', whiteSpace: 'nowrap' }}
              onClick={() => setView && setView("entry")}
            >
              Sadhana Entry
            </button>
          </div>
          <div className="text-center mt-3 d-flex flex-column gap-2 align-items-center">
            <button className="btn btn-danger btn-lg px-5 fw-bold mb-2" onClick={() => setView && setView("upgradePremium")}>Upgrade to Premium</button>
          </div>
        </div>
      </div>
    );
  }

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
      <h2 className="todo-title">Plan Your Day</h2>
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
