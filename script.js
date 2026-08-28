// To-Do List App with Local Storage
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const clearAllBtn = document.getElementById('clearAll');

const totalCountSpan = document.getElementById('totalCount');
const activeCountSpan = document.getElementById('activeCount');
const completedCountSpan = document.getElementById('completedCount');

let todos = [];
let currentFilter = 'all';
const STORAGE_KEY = 'todos';

// Load todos from localStorage on page load
function loadTodos() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        todos = JSON.parse(stored);
        renderTodos();
        updateStats();
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Add a new todo
function addTodo() {
    const text = todoInput.value.trim();

    if (text === '') {
        alert('Please enter a task!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    todos.unshift(todo);
    saveTodos();
    renderTodos();
    updateStats();
    todoInput.value = '';
    todoInput.focus();
}

// Toggle todo completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Delete a todo
function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
    updateStats();
}

// Clear all completed todos
function clearCompleted() {
    if (confirm('Are you sure you want to delete all completed tasks?')) {
        todos = todos.filter(t => !t.completed);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Clear all todos
function clearAll() {
    if (confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
        todos = [];
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Render todos based on current filter
function renderTodos() {
    todoList.innerHTML = '';

    let filteredTodos = todos;

    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    if (filteredTodos.length === 0) {
        emptyState.classList.add('show');
        todoList.style.minHeight = 'auto';
        return;
    }

    emptyState.classList.remove('show');
    todoList.style.minHeight = '200px';

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <span class="todo-time">${todo.createdAt}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
        `;
        todoList.appendChild(li);
    });
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;

    totalCountSpan.textContent = total;
    activeCountSpan.textContent = active;
    completedCountSpan.textContent = completed;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Event Listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);
clearAllBtn.addEventListener('click', clearAll);

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    todoInput.focus();
});

// Auto-save on visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        saveTodos();
    }
});

// Save before page unload
window.addEventListener('beforeunload', () => {
    saveTodos();
});