// Timer and Pomodoro state
let isRunning = false;
let isPomodoroMode = false;
let startTime = 0;
let elapsedTime = 0;
let timerInterval;
let customPomodoroLength = 25 * 60; // Default 25 minutes in seconds
let customBreakLength = 5 * 60; // Default 5 minutes in seconds

// Task Management
const tasks = [];

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - moved inside DOMContentLoaded to ensure elements exist
    const taskInput = document.getElementById('taskInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskSelect = document.getElementById('taskSelect');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const modeToggleBtn = document.getElementById('modeToggleBtn');
    const timerDisplay = document.querySelector('.time');
    const taskList = document.getElementById('taskList');

    // Create and configure length inputs
    const pomodoroLengthInput = document.createElement('input');
    pomodoroLengthInput.type = 'number';
    pomodoroLengthInput.value = 25;
    pomodoroLengthInput.id = 'pomodoroLengthInput';
    pomodoroLengthInput.className = 'input input-bordered w-20';

    const breakLengthInput = document.createElement('input');
    breakLengthInput.type = 'number';
    breakLengthInput.value = 5;
    breakLengthInput.id = 'breakLengthInput';
    breakLengthInput.className = 'input input-bordered w-20';

    // Timer Controls
    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            startTime = Date.now() - elapsedTime;
            timerInterval = setInterval(updateTimer, 1000);
            startBtn.querySelector('img').src = '/dist/assets/pause.svg';
        } else {
            isRunning = false;
            clearInterval(timerInterval);
            startBtn.querySelector('img').src = '/dist/assets/play.svg';
        }
    }

    function updateTimer() {
        if (isPomodoroMode) {
            const timeLeft = customPomodoroLength - Math.floor((Date.now() - startTime) / 1000);
            if (timeLeft <= 0) {
                const notificationSound = document.getElementById('notificationSound');
                if (notificationSound) {
                    notificationSound.play().catch(error => console.log('Error playing sound:', error));
                }
                resetTimer();
                return;
            }
            displayTime(timeLeft);
        } else {
            elapsedTime = Date.now() - startTime;
            displayTime(Math.floor(elapsedTime / 1000));
        }
    }

    function displayTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        timerDisplay.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    function pad(num) {
        return num.toString().padStart(2, '0');
    }

    function resetTimer() {
        isRunning = false;
        elapsedTime = 0;
        clearInterval(timerInterval);
        displayTime(0);
        const playButton = startBtn.querySelector('img');
        if (playButton) {
            playButton.src = '/dist/assets/play.svg';
        }
        const originalResetTimer = resetTimer;
        resetTimer = function() {
            if (isRunning && isPomodoroMode) {
                onPomodoroComplete();
            }
            originalResetTimer();
        };

    }

    // Storage functions
    function saveToStorage() {
        const settings = {
            customPomodoroLength,
            customBreakLength,
            isPomodoroMode,
            tasks
        };

        try {
            localStorage.setItem('timerSettings', JSON.stringify(settings));
            document.cookie = `timerSettings=${JSON.stringify(settings)}; expires=${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    function loadFromStorage() {
        try {
            // Try localStorage first
            const localData = localStorage.getItem('timerSettings');

            // If no localStorage, try cookies
            const cookieData = document.cookie.split(';')
                .find(cookie => cookie.trim().startsWith('timerSettings='));

            const settings = localData ? JSON.parse(localData) :
                cookieData ? JSON.parse(cookieData.split('=')[1]) : null;

            if (settings) {
                customPomodoroLength = settings.customPomodoroLength || 25 * 60;
                customBreakLength = settings.customBreakLength || 5 * 60;
                isPomodoroMode = settings.isPomodoroMode;
                tasks.length = 0; // Clear existing tasks
                tasks.push(...(settings.tasks || []));
                updateUI();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    function updateUI() {
        const pomodoroInput = document.getElementById('pomodoroLengthInput');
        const breakInput = document.getElementById('breakLengthInput');

        if (pomodoroInput) pomodoroInput.value = customPomodoroLength / 60;
        if (breakInput) breakInput.value = customBreakLength / 60;

        updateTaskSelect();
        updateTaskList();
    }

    // Task Management Functions
    function addTask() {
        const taskName = taskInput.value.trim();
        const description = descriptionInput.value.trim();

        if (taskName) {
            const task = {
                id: Date.now(),
                name: taskName,
                description: description,
                timeSpent: 0
            };

            tasks.push(task);
            updateTaskSelect();
            updateTaskList();
            saveToStorage();

            taskInput.value = '';
            descriptionInput.value = '';
        }
    }

    function updateTaskSelect() {
        if (!taskSelect) return;

        taskSelect.innerHTML = '<option class="disabled selected">Select a task</option>';
        tasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.name;
            taskSelect.appendChild(option);
        });
    }

    function updateTaskList() {
        if (!taskList) return;

        taskList.innerHTML = '';
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.innerHTML = `
                <div class="form-control">
                    <label class="label cursor-pointer">
                        <h3>${task.name}</h3>
                        Time spent: ${Math.floor(task.timeSpent / 3600)}h ${Math.floor((task.timeSpent % 3600) / 60)}m
                        <input type="checkbox" class="checkbox checkbox-error" />
                    </label>
                    <p>${task.description}</p>
                </div>
            `;

            // Add delete functionality
            const checkbox = taskElement.querySelector('.checkbox');
            checkbox.addEventListener('change', () => deleteTask(task.id));

            taskList.appendChild(taskElement);
        });
    }

    function deleteTask(taskId) {
        const index = tasks.findIndex(task => task.id === taskId);
        if (index !== -1) {
            tasks.splice(index, 1);
            updateTaskSelect();
            updateTaskList();
            saveToStorage();
        }
    }

    // Event Listeners
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
    if (addTaskBtn) addTaskBtn.addEventListener('click', addTask);
    if (modeToggleBtn) {
        modeToggleBtn.addEventListener('click', () => {
            isPomodoroMode = !isPomodoroMode;
            resetTimer();
            modeToggleBtn.textContent = isPomodoroMode ? 'Switch to Stopwatch' : 'Switch to Pomodoro';
            const timerMode = document.querySelector('.timer-mode');
            if (timerMode) {
                timerMode.textContent = isPomodoroMode ? 'Pomodoro Mode' : 'Stopwatch Mode';
            }
            saveToStorage();
        });
    }

    // Initialize countdown function if needed
    function updateCountdown() {
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);
        const seconds = Math.floor(Math.random() * 60);

        const spans = document.querySelectorAll('.countdown > span[data-value]');
        spans.forEach((span, index) => {
            const value = [hours, minutes, seconds][index];
            span.style.setProperty('--value', value);
        });
    }

    // Start the countdown if elements exist
    if (document.querySelector('.countdown')) {
        updateCountdown();
        setInterval(updateCountdown, 1500);
    }

    // Load saved settings on startup
    loadFromStorage();
});
// Add this to your existing JavaScript file

// Stats tracking state
let pomodoroStats = {
    completedSessions: 0,
    totalWorkTime: 0,
    lastSessionDate: null,
    dailyStats: {},
    taskStats: {}
};

// Load stats from storage
function loadStats() {
    const savedStats = localStorage.getItem('pomodoroStats');
    if (savedStats) {
        pomodoroStats = JSON.parse(savedStats);
    }
}

// Save stats to storage
function saveStats() {
    localStorage.setItem('pomodoroStats', JSON.stringify(pomodoroStats));
}

// Update stats when a Pomodoro session completes
function updatePomodoroStats() {
    const today = new Date().toISOString().split('T')[0];

    pomodoroStats.completedSessions++;
    pomodoroStats.totalWorkTime += customPomodoroLength;
    pomodoroStats.lastSessionDate = new Date().toISOString();

    if (!pomodoroStats.dailyStats[today]) {
        pomodoroStats.dailyStats[today] = {
            sessions: 0,
            workTime: 0
        };
    }
    pomodoroStats.dailyStats[today].sessions++;
    pomodoroStats.dailyStats[today].workTime += customPomodoroLength;

    const selectedTask = taskSelect.value;
    if (selectedTask && selectedTask !== "Select a task") {
        if (!pomodoroStats.taskStats[selectedTask]) {
            pomodoroStats.taskStats[selectedTask] = {
                sessions: 0,
                workTime: 0
            };
        }
        pomodoroStats.taskStats[selectedTask].sessions++;
        pomodoroStats.taskStats[selectedTask].workTime += customPomodoroLength;
    }

    saveStats();
    updateStatsDisplay();
}

// Format time function
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

// Update the stats display with DaisyUI components
function updateStatsDisplay() {
    const statsContent = document.getElementById('statsContent');
    if (!statsContent) return;

    const today = new Date().toISOString().split('T')[0];
    const todayStats = pomodoroStats.dailyStats[today] || { sessions: 0, workTime: 0 };

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.timeSpent > 0).length;
    const successRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;
    const avgSessionDuration = pomodoroStats.completedSessions > 0
        ? pomodoroStats.totalWorkTime / pomodoroStats.completedSessions
        : 0;

    statsContent.innerHTML = `
        <div class="flex flex-col gap-6">
            <!-- Stats Summary -->
            <div class="stats shadow bg-base-200 w-full">
                <div class="stat">
                    <div class="stat-figure text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <div class="stat-title">Total Sessions</div>
                    <div class="stat-value text-primary">${pomodoroStats.completedSessions}</div>
                    <div class="stat-desc">Pomodoro sessions completed</div>
                </div>
                
                <div class="stat">
                    <div class="stat-figure text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                        </svg>
                    </div>
                    <div class="stat-title">Success Rate</div>
                    <div class="stat-value text-secondary">${successRate}%</div>
                    <div class="stat-desc">Tasks with time tracked</div>
                </div>
                
                <div class="stat">
                    <div class="stat-figure text-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                        </svg>
                    </div>
                    <div class="stat-title">Total Work Time</div>
                    <div class="stat-value">${formatTime(pomodoroStats.totalWorkTime)}</div>
                    <div class="stat-desc">Avg session: ${formatTime(avgSessionDuration)}</div>
                </div>
            </div>

            <!-- Today's Progress -->
            <div class="card bg-base-200 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Today's Progress
                    </h2>
                    <div class="stats stats-vertical shadow">
                        <div class="stat">
                            <div class="stat-title">Sessions Completed</div>
                            <div class="stat-value">${todayStats.sessions}</div>
                        </div>
                        <div class="stat">
                            <div class="stat-title">Time Focused</div>
                            <div class="stat-value">${formatTime(todayStats.workTime)}</div>
                        </div>
                        <div class="stat">
                            <div class="stat-title">Active Tasks</div>
                            <div class="stat-value">${tasks.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Task Statistics -->
            <div class="card bg-base-200 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        Task Statistics
                    </h2>
                    <div class="overflow-x-auto">
                        <table class="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th>Task Name</th>
                                    <th>Sessions</th>
                                    <th>Time Spent</th>
                                    <th>Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(pomodoroStats.taskStats).map(([taskId, stats]) => {
        const task = tasks.find(t => t.id.toString() === taskId);
        if (!task) return '';
        const progressPercent = Math.min((stats.workTime / (2 * 3600)) * 100, 100);
        return `
                                        <tr>
                                            <td>
                                                <div class="font-bold">${task.name}</div>
                                                <div class="text-sm opacity-50">${task.description || 'No description'}</div>
                                            </td>
                                            <td>${stats.sessions}</td>
                                            <td>${formatTime(stats.workTime)}</td>
                                            <td>
                                                <progress class="progress progress-primary" value="${progressPercent}" max="100"></progress>
                                            </td>
                                        </tr>
                                    `;
    }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Add this HTML to your page
const statsHTML = `
<div class="stats-container p-4">
    <div class="text-sm breadcrumbs mb-4">
        <ul>
            <li><a>Dashboard</a></li>
            <li>Statistics</li>
        </ul>
    </div>
    <div id="statsContent"></div>
</div>
`;


    // Create stats tab/page
    const mainContainer = document.querySelector('main') || document.body;
    const statsDiv = document.createElement('div');
    statsDiv.innerHTML = statsHTML;
    mainContainer.appendChild(statsDiv);

    // Load and display initial stats
    loadStats();
    updateStatsDisplay();

    // Modify your existing timer code to update stats

    function onPomodoroComplete() {
        if (isPomodoroMode) {
            updatePomodoroStats();
        }
    }
});
