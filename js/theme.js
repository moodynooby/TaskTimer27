// Create a new file for theme management
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        document.documentElement.setAttribute('data-theme', this.theme);
        document.querySelector('.theme-toggle').innerHTML = this.theme === 'light' ? '🌙' : '☀️';
    }

    toggle() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        document.querySelector('.theme-toggle').innerHTML = this.theme === 'light' ? '🌙' : '☀️';
        localStorage.setItem('theme', this.theme);
    }
}