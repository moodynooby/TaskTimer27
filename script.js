class Timer {
    constructor(displayElement) {
        this.displayElement = displayElement;
        this.isRunning = false;
        this.time = 0;
        this.interval = null;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.interval = setInterval(() => {
                this.time++;
                this.updateDisplay();
            }, 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.interval);
        }
    }

    reset() {
        this.pause();
        this.time = 0;
        this.updateDisplay();
    }

    formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateDisplay() {
        if (this.displayElement) {
            this.displayElement.textContent = this.formatTime(this.time);
        }
    }
}

class PomodoroTimer extends Timer {
    constructor(displayElement, modeElement, progressElement) {
        super(displayElement);
        this.modeElement = modeElement;
        this.progressElement = progressElement;
        this.workDuration = 50 * 60;
        this.breakDuration = 10 * 60;
        this.isWorkTime = true;
        this.remainingTime = this.workDuration;
        this.notificationSound = document.getElementById('notificationSound');
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.interval = setInterval(() => this.updateTimer(), 1000);
        }
    }

    updateTimer() {
        this.remainingTime--;
        
        if (this.remainingTime <= 0) {
            this.notificationSound.play().catch(e => console.log('Audio playback failed:', e));
            this.isWorkTime = !this.isWorkTime;
            this.remainingTime = this.isWorkTime ? this.workDuration : this.breakDuration;
        }
        
        this.updateDisplay();
    }

    reset() {
        this.pause();
        this.isWorkTime = true;
        this.remainingTime = this.workDuration;
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.displayElement) {
            this.displayElement.textContent = this.formatTime(this.remainingTime);
        }
        if (this.modeElement) {
            this.modeElement.textContent = `${this.isWorkTime ? 'Work' : 'Break'} Time`;
        }
        if (this.progressElement) {
            const totalTime = this.isWorkTime ? this.workDuration : this.breakDuration;
            const progress = 1 - (this.remainingTime / totalTime);
            const circumference = 2 * Math.PI * 90;
            this.progressElement.style.strokeDasharray = `${circumference} ${circumference}`;
            this.progressElement.style.strokeDashoffset = circumference * (1 - progress);
        }
    }

    updateSettings(workDuration, breakDuration) {
        this.workDuration = workDuration * 60;
        this.breakDuration = breakDuration * 60;
        if (this.isWorkTime) {
            this.remainingTime = this.workDuration;
        } else {
            this.remainingTime = this.breakDuration;
        }
        this.updateDisplay();
    }
}

class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        this.taskTimers = new Map();
        this.selectedTaskId = null;
        
        this.mainTimer = new Timer(document.querySelector('.time'));
        this.pomodoroTimer = new PomodoroTimer(
            document.querySelector('.time'),
            document.querySelector('.timer-mode'),
            document.querySelector('.progress-ring-circle')
        );
        
        this.currentTimer = this.mainTimer;
        this.currentMode = 'stopwatch';
        
        this.initializeElements();
        this.setupEventListeners();
        this.renderTasks();
        this.updateTaskSelect();
    }

    initializeElements() {
        this.elements = {
            taskInput: document.getElementById('taskInput'),
            addTaskBtn: document.getElementById('addTaskBtn'),
            taskList: document.getElementById('taskList'),
            taskSelect: document.getElementById('taskSelect'),
            startBtn: document.getElementById('startBtn'),
            resetBtn: document.getElementById('resetBtn'),
            modeToggleBtn: document.getElementById('modeToggleBtn'),
            themeToggle: document.querySelector('.theme-toggle'),
            settingsToggle: document.querySelector('.settings-toggle'),
            settingsPanel: document.querySelector('.settings-panel'),
            workDuration: document.getElementById('workDuration'),
            breakDuration: document.getElementById('breakDuration')
        };
    }

    setupEventListeners() {
        this.elements.addTaskBtn.addEventListener('click', () => this.addTask());
        this.elements.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        this.elements.taskSelect.addEventListener('change', (e) => {
            this.selectedTaskId = e.target.value;
            this.updateMainTimerDisplay();
        });
        
        this.elements.startBtn.addEventListener('click', () => this.toggleTimer());
        this.elements.resetBtn.addEventListener('click', () => this.resetTimer());
        this.elements.modeToggleBtn.addEventListener('click', () => this.toggleMode());
        
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.settingsToggle.addEventListener('click', () => {
            this.elements.settingsPanel.classList.toggle('open');
        });
        
        this.elements.workDuration.addEventListener('change', () => this.updatePomodoroSettings());
        this.elements.breakDuration.addEventListener('change', () => this.updatePomodoroSettings());
    }

    toggleTimer() {
        if (this.currentTimer.isRunning) {
            this.currentTimer.pause();
            this.elements.startBtn.textContent = '▶️';
        } else {
            this.currentTimer.start();
            this.elements.startBtn.textContent = '⏸️';
        }
    }

    resetTimer() {
        this.currentTimer.reset();
        this.elements.startBtn.textContent = '▶️';
    }

    toggleMode() {
        this.currentTimer.pause();
        this.elements.startBtn.textContent = '▶️';
        
        if (this.currentMode === 'stopwatch') {
            this.currentMode = 'pomodoro';
            this.currentTimer = this.pomodoroTimer;
            this.elements.modeToggleBtn.textContent = 'Switch to Stopwatch';
        } else {
            this.currentMode = 'stopwatch';
            this.currentTimer = this.mainTimer;
            this.elements.modeToggleBtn.textContent = 'Switch to Pomodoro';
        }
        
        this.currentTimer.reset();
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        this.elements.themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
        localStorage.setItem('theme', newTheme);
    }

    updatePomodoroSettings() {
        const workDuration = Math.max(1, Math.min(120, parseInt(this.elements.workDuration.value) || 50));
        const breakDuration = Math.max(1, Math.min(30, parseInt(this.elements.breakDuration.value) || 10));
        
        this.elements.workDuration.value = workDuration;
        this.elements.breakDuration.value = breakDuration;
        
        this.pomodoroTimer.updateSettings(workDuration, breakDuration);
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
        this.updateTaskSelect();
    }

    toggleTaskComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            if (this.selectedTaskId === id && task.completed) {
                this.selectedTaskId = null;
            }
            this.saveTasks();
            this.renderTasks();
            this.updateTaskSelect();
            this.updateMainTimerDisplay();
        }
    }

    deleteTask(id) {
        if (this.selectedTaskId === id) {
            this.selectedTaskId = null;
        }
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskSelect();
        this.updateMainTimerDisplay();
    }

    updateTaskSelect() {
        const activeTasks = this.tasks.filter(t => !t.completed);
        this.elements.taskSelect.innerHTML = `
            <option value="">Select a task...</option>
            ${activeTasks.map(task => `
                <option value="${task.id}" ${task.id === this.selectedTaskId ? 'selected' : ''}>
                    ${task.title}
                </option>
            `).join('')}
        `;
    }

    updateMainTimerDisplay() {
        const timerLabel = document.querySelector('.timer-label');
        if (this.selectedTaskId) {
            const task = this.tasks.find(t => t.id === this.selectedTaskId);
            timerLabel.textContent = `Current Task: ${task.title}`;
        } else {
            timerLabel.textContent = 'No task selected';
        }
    }

    renderTasks() {
        this.elements.taskList.innerHTML = this.tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''} ${task.id === this.selectedTaskId ? 'selected' : ''}">
                <div class="task-header">
                    <div class="task-title">
                        <button onclick="taskManager.toggleTaskComplete('${task.id}')">
                            ${task.completed ? '✅' : '⭕'}
                        </button>
                        ${task.title}
                    </div>
                    <button class="delete-btn" onclick="taskManager.deleteTask('${task.id}')">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
}

// Initialize the app
const taskManager = new TaskManager();

// Set initial theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
document.querySelector('.theme-toggle').textContent = savedTheme === 'light' ? '🌙' : '☀️';