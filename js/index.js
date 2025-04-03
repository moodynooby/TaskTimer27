//timer=stopwatch; pomodromo=timer

// Timer and Pomodoro state
let isRunning = false;
let isPomodoroMode = false;
let startTime = 0;
let elapsedTime = 0;
let timerInterval;
let customPomodoroLength = 25 * 60; 

// Task Management
const tasks = [];

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    if ('Notification' in window) {
        Notification.requestPermission();
    }    
    const taskInput = document.getElementById('taskInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskSelect = document.getElementById('taskSelect');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const modeToggleBtn = document.getElementById('modeToggleBtn');
    const timerDisplay = document.querySelector('.time');
    const taskList = document.getElementById('taskList');
    const pomoBtn = document.getElementById('pomodoroLengthInput');

    // Initially hide the pomodoro button
    if (pomoBtn) {
        pomoBtn.style.display = isPomodoroMode ? 'block' : 'none';
        // Add onChange event listener to update settings
        pomoBtn.addEventListener('change', (e) => {
            customPomodoroLength = e.target.value * 60;
            saveToStorage();
        });
    }

    // Create and configure length inputs
    const pomodoroLengthInput = document.createElement('input');
    pomodoroLengthInput.type = 'number';
    pomodoroLengthInput.value = customPomodoroLength / 60;
    pomodoroLengthInput.id = 'pomodoroLengthInput';
    pomodoroLengthInput.className = 'input input-bordered w-20';
    pomodoroLengthInput.style = 'none';

    // Timer Controls
    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            startTime = Date.now() - elapsedTime;
            timerInterval = setInterval(updateTimer, 1000);
            if (startBtn.querySelector('img')) {
                startBtn.querySelector('img').src = '../assets/pause.svg';
            }
        } else {
            isRunning = false;
            clearInterval(timerInterval);
            if (startBtn.querySelector('img')) {
                startBtn.querySelector('img').src = ' ../assets/play.svg';
            }
        }
    }

    function updateTimer() {
        if (isPomodoroMode) {
            const totalTime = customPomodoroLength;
            const timeLeft = totalTime - Math.floor((Date.now() - startTime) / 1000);
            const progress = ((totalTime - timeLeft) / totalTime) * 100;

            // Update progress bar if it exists
            const progressRing = document.querySelector('.timer-progress-ring');
            if (progressRing) {
                const radius = progressRing.r.baseVal.value;
                const circumference = radius * 2 * Math.PI;
                const offset = circumference - (progress / 100) * circumference;
                progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
                progressRing.style.strokeDashoffset = offset;
            }
            if (timeLeft <= 0) {
                if (Notification.permission === 'granted') {
                    new Notification('Timer Done!', {
                        body: 'Pomodoro session completed!',
                        icon: '../assets/timer-icon.png'
                    });
                }
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
            playButton.src = '../assets/play.svg';
        }
    }

    // Storage functions
    function saveToStorage() {
        const settings = {
            customPomodoroLength,
            isPomodoroMode,
            tasks,
            theme: document.documentElement.getAttribute('data-theme') || 'default'
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
                isPomodoroMode = settings.isPomodoroMode;
                tasks.length = 0;
                tasks.push(...(settings.tasks || []));
                
                // Apply saved theme if available
                if (settings.theme) {
                    document.documentElement.setAttribute('data-theme', settings.theme);
                }
                
                updateUI();
            }
            
            // Also check for theme in taskTimerSettings
            const themeSettings = localStorage.getItem('taskTimerSettings');
            if (themeSettings) {
                const parsedThemeSettings = JSON.parse(themeSettings);
                if (parsedThemeSettings.theme) {
                    document.documentElement.setAttribute('data-theme', parsedThemeSettings.theme);
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    function updateUI() {
        const pomodoroInput = document.getElementById('pomodoroLengthInput');
        if (pomodoroInput) {
            pomodoroInput.value = customPomodoroLength / 60;
            pomodoroInput.style.display = isPomodoroMode ? 'block' : 'none';
        }
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

    // Event Listeners
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
    if (addTaskBtn) addTaskBtn.addEventListener('click', addTask);
    if (modeToggleBtn) {
        modeToggleBtn.addEventListener('click', () => {
            isPomodoroMode = !isPomodoroMode;
            resetTimer();
            
            // Update pomoBtn visibility based on mode
            if (pomoBtn) {
                pomoBtn.style.display = isPomodoroMode ? 'block' : 'none';
            }
            
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

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            startTimer();
        } else if (e.code === 'KeyR') {
            e.preventDefault();
            resetTimer();
        } else if (e.code === 'KeyM') {
            e.preventDefault();
            modeToggleBtn.click();
        }
    });
});
