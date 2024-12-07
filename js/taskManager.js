class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks') || '[]');saveInputs
        this.currentTimer = new Timer(document.querySelector('.time'));
        this.pomodoroTimer = new PomodoroTimer(
            document.querySelector('.time'),
            document.querySelector('.timer-mode'),
            document.querySelector('.progress-ring-circle')
        );
        
        this.currentMode = 'stopwatch';
        this.selectedTaskId = null;
        
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

        // Validate that all required elements exist
        Object.entries(this.elements).forEach(([key, element]) => {
            if (!element) {
                console.error(`Required element "${key}" not found in the DOM`);
            }
        });
    }

    setupEventListeners() {
        if (this.elements.addTaskBtn) {
            this.elements.addTaskBtn.addEventListener('click', () => this.addTask());
        }
        
        if (this.elements.taskInput) {
            this.elements.taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addTask();
            });
        }
        
        if (this.elements.taskSelect) {
            this.elements.taskSelect.addEventListener('change', (e) => {
                this.selectedTaskId = e.target.value;
                this.updateMainTimerDisplay();
            });
        }
        
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => this.toggleTimer());
        }
        
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => this.resetTimer());
        }
        
        if (this.elements.modeToggleBtn) {
            this.elements.modeToggleBtn.addEventListener('click', () => this.toggleMode());
        }
        
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        if (this.elements.settingsToggle && this.elements.settingsPanel) {
            this.elements.settingsToggle.addEventListener('click', () => {
                this.elements.settingsPanel.classList.toggle('open');
            });
        }
        
        if (this.elements.workDuration && this.elements.breakDuration) {
            this.elements.workDuration.addEventListener('change', () => this.updatePomodoroSettings());
            this.elements.breakDuration.addEventListener('change', () => this.updatePomodoroSettings());
        }
    }

    // Rest of the TaskManager class implementation remains the same
    addTask() {
        const title = this.elements.taskInput.value.trim();
        const description = "Enter task description (optional):" // Add description prompt

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

    toggleTimer() {
        const timer = this.currentMode === 'stopwatch' ? this.currentTimer : this.pomodoroTimer;
        if (timer.isRunning) {
            timer.pause();
            this.elements.startBtn.innerHTML = `
                                       <img class=play-icon src="/dist/assets/play.svg">
`;
        } else {
            timer.start();
            this.elements.startBtn.innerHTML = `
                                       <img class=play-icon src="/dist/assets/pause.svg">
`;
        }
    }

    resetTimer() {
        const timer = this.currentMode === 'stopwatch' ? this.currentTimer : this.pomodoroTimer;
        timer.reset();
        this.elements.startBtn.innerHTML = `
                                              <img class=play-icon src="/dist/assets/play.svg">
`;
    }

    toggleMode() {
        const timer = this.currentMode === 'stopwatch' ? this.currentTimer : this.pomodoroTimer;
        timer.pause();
        this.elements.startBtn.innerHTML = `
                                   <img class=play-icon src="/dist/assets/play.svg">`;
        
        if (this.currentMode === 'stopwatch') {
            this.currentMode = 'pomodoro';
            this.currentTimer = this.pomodoroTimer;
            this.elements.modeToggleBtn.textContent = 'Switch to Stopwatch';
        } else {
            this.currentMode = 'stopwatch';
            this.currentTimer = this.currentTimer;
            this.elements.modeToggleBtn.textContent = 'Switch to Pomodoro';
        }
        
        this.currentTimer.reset();
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
        localStorage.setItem('theme', newTheme);
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
                            ${task.completed ? '<img class="themes-icon" src="/dist/assets/Check.svg">' : '<img src="/dist/assets/cancel.svg" alt="remove" class="themes-icon">'}
                        </button>
                        ${task.title}
                    </div>
                    <button class="delete-btn" onclick="taskManager.deleteTask('${task.id}')">
                        <img src="/dist/assets/Delete.svg" alt="remove" class="themes-icon">
                    </button>
                </div>
            </div>
        `).join('');
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    updatePomodoroSettings() {
        if (!this.elements.workDuration || !this.elements.breakDuration) return;
        
        const workDuration = Math.max(1, Math.min(120, parseInt(this.elements.workDuration.value) || 50));
        const breakDuration = Math.max(1, Math.min(30, parseInt(this.elements.breakDuration.value) || 10));
        
        this.elements.workDuration.value = workDuration;
        this.elements.breakDuration.value = breakDuration;
        
        this.pomodoroTimer.updateSettings(workDuration, breakDuration);
    }

}

