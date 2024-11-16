// Create a new file for the Timer class
class Timer {
    constructor(displayElement, mode = 'stopwatch') {
        this.currentMode = mode;
        this.isRunning = false;
        this.time = 0;
        this.displayElement = displayElement;
        this.timerInterval = null;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.timerInterval = setInterval(() => {
                this.time++;
                this.updateDisplay();
            }, 1000);
        }
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
    }

    reset() {
        this.pause();
        this.time = 0;
        this.updateDisplay();
    }

    getTime() {
        return this.time;
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