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

// Stats tracking state
let pomodoroStats = {
    completedSessions: 0,
    totalWorkTime: 0,
    lastSessionDate: null,
    dailyStats: {},
    taskStats: {}
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
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
            if (startBtn.querySelector('img')) {
                startBtn.querySelector('img').src = '/dist/assets/pause.svg';
            }
        } else {
            isRunning = false;
            clearInterval(timerInterval);
            if (startBtn.querySelector('img')) {
                startBtn.querySelector('img').src = '/dist/assets/play.svg';
            }
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
                onPomodoroComplete();
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
        if (timerDisplay) {
            timerDisplay.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
        }
    }

    function pad(num) {
        return num.toString().padStart(2, '0');
    }

    function resetTimer() {
        isRunning = false;
        elapsedTime = 0;
        clearInterval(timerInterval);
        displayTime(0);
        const playButton = startBtn?.querySelector('img');
        if (playButton) {
            playButton.src = '/dist/assets/play.svg';
        }
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
            const localData = localStorage.getItem('timerSettings');
            const cookieData = document.cookie.split(';')
                .find(cookie => cookie.trim().startsWith('timerSettings='));

            const settings = localData ? JSON.parse(localData) :
                cookieData ? JSON.parse(cookieData.split('=')[1]) : null;

            if (settings) {
                customPomodoroLength = settings.customPomodoroLength || 25 * 60;
                customBreakLength = settings.customBreakLength || 5 * 60;
                isPomodoroMode = settings.isPomodoroMode;
                tasks.length = 0;
                tasks.push(...(settings.tasks || []));
                updateUI();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    // Stats functions
    function loadStats() {
        const savedStats = localStorage.getItem('pomodoroStats');
        if (savedStats) {
            pomodoroStats = JSON.parse(savedStats);
        }
    }

    function saveStats() {
        localStorage.setItem('pomodoroStats', JSON.stringify(pomodoroStats));
    }

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

        const selectedTask = taskSelect?.value;
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

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
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
        const taskName = taskInput?.value.trim();
        const description = descriptionInput?.value.trim();

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

            if (taskInput) taskInput.value = '';
            if (descriptionInput) descriptionInput.value = '';
        }
    }

    function updateTaskSelect() {
        if (!taskSelect) return;

        taskSelect.innerHTML = '<option value="">Select a task</option>';
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
                        <span>Time spent: ${formatTime(task.timeSpent)}</span>
                        <input type="checkbox" class="checkbox checkbox-error" />
                    </label>
                    <p>${task.description || ''}</p>
                </div>
            `;

            const checkbox = taskElement.querySelector('.checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', () => deleteTask(task.id));
            }

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

    function onPomodoroComplete() {
        if (isPomodoroMode) {
            updatePomodoroStats();
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

    // Initialize
    loadFromStorage();
    loadStats();
    updateStatsDisplay();
});