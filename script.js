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
const pomodoroLengthInput = document.createElement('input');
pomodoroLengthInput.type = 'number';
pomodoroLengthInput.value = 25;
pomodoroLengthInput.className = 'input input-bordered w-20';

const breakLengthInput = document.createElement('input');
breakLengthInput.type = 'number';
breakLengthInput.value = 5;
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

function updateTimerSettings() {
    customPomodoroLength = pomodoroLengthInput.value * 60;
    customBreakLength = breakLengthInput.value * 60;
    saveToCookies();
}

function saveToStorage() {
    // Save to localStorage
    localStorage.setItem('timerSettings', JSON.stringify({
        customPomodoroLength,
        customBreakLength,
        isPomodoroMode,
        tasks
    }));

    // Save to cookies
    document.cookie = `timerSettings=${JSON.stringify({
        customPomodoroLength,
        customBreakLength,
        isPomodoroMode,
        tasks
    })}; expires=${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
}

function loadFromStorage() {
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
        tasks.push(...(settings.tasks || []));

        updateUI();
    }
}

function updateUI() {
    if (document.getElementById('pomodoroLengthInput')) {
        document.getElementById('pomodoroLengthInput').value = customPomodoroLength / 60;
    }
    if (document.getElementById('breakLengthInput')) {
        document.getElementById('breakLengthInput').value = customBreakLength / 60;
    }
    updateTaskSelect();
    updateTaskList();
}

// Update existing event listeners to use new storage functions
document.addEventListener('DOMContentLoaded', loadFromStorage);

function updateTimerSettings() {
    customPomodoroLength = document.getElementById('pomodoroLengthInput').value * 60;
    customBreakLength = document.getElementById('breakLengthInput').value * 60;
    saveToStorage();
}

function updateTimer() {
    if (isPomodoroMode) {
        const timeLeft = customPomodoroLength - Math.floor((Date.now() - startTime) / 1000);
        if (timeLeft <= 0) {
            document.getElementById('notificationSound').play();
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
    startBtn.querySelector('img').src = '/dist/assets/play.svg';
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

        taskInput.value = '';
        descriptionInput.value = '';
    }
    saveToCookies();

}

function updateTaskSelect() {
    taskSelect.innerHTML = '<option class="disabled selected">Select a task</option>';
    tasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = task.name;
        taskSelect.appendChild(option);
    });
}

function updateTaskList() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
             <button onclick="deleteTask(${task.id})" class="btn btn-error btn-sm btn-circle delete" ><img src="/dist/assets/delete.svg"></button>

            <h3>${task.name}</h3>            <p>${task.description}</p>

            <p>Time spent: ${Math.floor(task.timeSpent / 3600)}h ${Math.floor((task.timeSpent % 3600) / 60)}m             
</p>
        `;
        taskList.appendChild(taskElement);
    });
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);
addTaskBtn.addEventListener('click', addTask);
modeToggleBtn.addEventListener('click', () => {
    isPomodoroMode = !isPomodoroMode;
    resetTimer();
    modeToggleBtn.textContent = isPomodoroMode ? 'Switch to Stopwatch' : 'Switch to Pomodoro';
    document.querySelector('.timer-mode').textContent = isPomodoroMode ? 'Pomodoro Mode' : 'Stopwatch Mode';
});
function deleteTask(taskId) {
    const index = tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
        tasks.splice(index, 1);
        updateTaskSelect();
        updateTaskList();
    }
    saveToCookies();

}
document.addEventListener('DOMContentLoaded', loadFromCookies);

