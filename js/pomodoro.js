// Create a new file for the Pomodoro timer
class PomodoroTimer {
    constructor() {
        this.settings = {
            workDuration: 50 * 60,
            breakDuration: 10 * 60,
            isWorkTime: true,
            remainingTime: 50 * 60
        };
        
        this.isRunning = false;
        this.timerInterval = null;
        this.elements = {
            display: document.querySelector('.time'),
            mode: document.querySelector('.timer-mode'),
            progressRing: document.querySelector('.progress-ring-circle'),
            notification: document.getElementById('notificationSound')
        };
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        }
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
    }

    reset() {
        this.pause();
        this.settings.isWorkTime = true;
        this.settings.remainingTime = this.settings.workDuration;
        this.updateDisplay();
    }

    updateTimer() {
        this.settings.remainingTime--;
        
        if (this.settings.remainingTime <= 0) {
            this.elements.notification.play().catch(e => console.log('Audio playback failed:', e));
            this.settings.isWorkTime = !this.settings.isWorkTime;
            this.settings.remainingTime = this.settings.isWorkTime ? 
                this.settings.workDuration : 
                this.settings.breakDuration;
        }
        
        this.updateDisplay();
    }

    updateDisplay() {
        const timeStr = this.formatTime(this.settings.remainingTime);
        this.elements.display.textContent = timeStr;
        this.elements.mode.textContent = `${this.settings.isWorkTime ? 'Work' : 'Break'} Time`;
        
        const totalTime = this.settings.isWorkTime ? 
            this.settings.workDuration : 
            this.settings.breakDuration;
        const progress = 1 - (this.settings.remainingTime / totalTime);
        const circumference = 2 * Math.PI * 90;
        this.elements.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        this.elements.progressRing.style.strokeDashoffset = circumference * (1 - progress);
    }

    formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateSettings(workDuration, breakDuration) {
        this.settings.workDuration = workDuration * 60;
        this.settings.breakDuration = breakDuration * 60;
        if (this.settings.isWorkTime) {
            this.settings.remainingTime = this.settings.workDuration;
        } else {
            this.settings.remainingTime = this.settings.breakDuration;
        }
        this.updateDisplay();
    }
}