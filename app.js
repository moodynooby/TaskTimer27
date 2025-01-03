let tasks = [];

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskName = taskInput.value.trim();
    
    if (taskName) {
        const task = {
            id: Date.now(),
            name: taskName,
            time: 0,
            isRunning: false,
            interval: null
        };
        
        tasks.push(task);
        taskInput.value = '';
        renderTasks();
    }
}

function WIP() {
    let x = document.getElementById("WIP");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
function openDialog() {

    document.getElementById("myDialog").style.display = "block";

}



function closeDialog() {

    document.getElementById("myDialog").style.display = "none";

}
function toggleTimer(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        if (task.isRunning) {
            clearInterval(task.interval);
            task.isRunning = false;
        } else {
            task.isRunning = true;
            task.interval = setInterval(() => {
                task.time++;
                updateTaskTime(taskId);
            }, 1000);
        }
        renderTasks();
    }
}

function deleteTask(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const task = tasks[taskIndex];
        if (task.interval) {
            clearInterval(task.interval);
        }
        tasks.splice(taskIndex, 1);
        renderTasks();
    }
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTaskTime(taskId) {
    const timeElement = document.getElementById(`time-${taskId}`);
    const task = tasks.find(t => t.id === taskId);
    if (timeElement && task) {
        timeElement.textContent = formatTime(task.time);
    }
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'border round';
        taskElement.innerHTML = `

            <div class="p-m padding">
                <div class="row">
                    <div class="col">
                        <h6>    ${task.name}</h6>
                        <p id="time-${task.id}">  ${formatTime(task.time)}</p>
                    </div>
                    <div class="col-auto">
                        <button class="button ${task.isRunning ? 'secondary' : 'primary'} border left-round" 
                                onclick="toggleTimer(${task.id})">
                            ${task.isRunning ? '<img src="assests/stop.svg">Stop' : '<img src="assests/play.svg">Start'}
                        </button>
                        <button class="button  border right-round " onclick="deleteTask(${task.id})">
                          <i>delete</i>  Delete
                        </button>
                    </div>
                </div>
            </div>
            <br>
        `;
        taskList.appendChild(taskElement);
    });
}