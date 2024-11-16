export class TaskManager {
    constructor() {
        this.tasks = [];
        this.elements = {
            taskInput: document.getElementById('taskInput'),
            addTaskBtn: document.getElementById('addTaskBtn'),
            taskList: document.getElementById('taskList')
        };
        
        this.setupEventListeners();
        this.loadTasks();
    }

    setupEventListeners() {
        this.elements.addTaskBtn.addEventListener('click', () => this.addTask());
        this.elements.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
    }

    addTask() {
        const title = this.elements.taskInput.value.trim();
        if (!title) return;

        const task = {
            id: Date.now().toString(),
            title,
            completed: false,
            elapsedTime: 0
        };

        this.tasks.push(task);
        this.elements.taskInput.value = '';
        this.saveTasks();
        this.renderTasks();
    }

    toggleTaskComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    renderTasks() {
        this.elements.taskList.innerHTML = this.tasks.map(task => `
            <div class="task-item">
                <div class="task-header">
                    <div class="task-title ${task.completed ? 'completed' : ''}">
                        <button onclick="taskManager.toggleTaskComplete('${task.id}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                ${task.completed ? 
                                    '<path d="M20 6L9 17l-5-5"/>' :
                                    '<circle cx="12" cy="12" r="10"/>'}
                            </svg>
                        </button>
                        ${task.title}
                    </div>
                    <button class="delete-btn" onclick="taskManager.deleteTask('${task.id}')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
                ${!task.completed ? `<div class="task-timer">${this.formatTime(task.elapsedTime)}</div>` : ''}
            </div>
        `).join('');
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
            this.renderTasks();
        }
    }
}