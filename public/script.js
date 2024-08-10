// Define your functions in the global scope
let addTask, toggleTask, deleteTask;

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');

    const fetchTasks = async () => {
        const response = await fetch('/tasks');
        const tasks = await response.json();
        taskList.innerHTML = tasks.map(task => `
            <li data-id="${task.id}">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${task.id}, this.checked)">
                ${task.description}
                <button onclick="deleteTask(${task.id})">Delete</button>
            </li>
        `).join('');
    };

    addTask = async (description) => {
        await fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description })
        });
        fetchTasks();
    };

    toggleTask = async (id, completed) => {
        await fetch(`/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        fetchTasks();
    };

    deleteTask = async (id) => {
        await fetch(`/tasks/${id}`, {
            method: 'DELETE'
        });
        fetchTasks();
    };

    taskForm.addEventListener('submit', event => {
        event.preventDefault();
        const description = document.getElementById('taskDescription').value;
        addTask(description);
        taskForm.reset();
    });

    fetchTasks();
});
