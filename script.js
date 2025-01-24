// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
});

function updateThemeIcon(theme) {
    const themeToggle = document.querySelector('.theme-toggle');
    if (theme === 'light') {
        themeToggle.innerHTML = `
                        <img class="themes-icon"  src="/dist/assets/light.svg" alt="icon">
`;
    } else {
        themeToggle.innerHTML = `
            <img class="themes-icon"  src="/dist/assets/Dark.svg" alt="icon">
            `;
    }
}

