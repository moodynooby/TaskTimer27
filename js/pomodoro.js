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
        this.notificationSound.volume = 1.0;
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
            this.pause();
            this.notificationSound.play().catch(e => console.log('Audio playback failed:', e));
            this.isWorkTime = !this.isWorkTime;
            this.remainingTime = this.isWorkTime ? this.workDuration : this.breakDuration;
            
            // Update UI to show session ended
            const sessionType = this.isWorkTime ? 'Work' : 'Break';
            this.modeElement.textContent = `${sessionType} Session - Click play to start`;
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