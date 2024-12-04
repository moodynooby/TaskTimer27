// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
    
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
});

function updateThemeIcon(theme) {
    const themeToggle = document.querySelector('.theme-toggle');
    if (theme === 'light') {
        themeToggle.innerHTML = `
                        <img class="themes-icon"  src="/dist/assets/light (2).svg">
`;
    } else {
        themeToggle.innerHTML = `
            <img class="themes-icon"  src="/dist/assets/dark (2).svg">
            `;
    }
}