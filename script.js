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
                        <img class="themes-icon"  src="/dist/assets/light.svg">
`;
    } else {
        themeToggle.innerHTML = `
            <img class="themes-icon"  src="/dist/assets/Dark.svg">
            `;
    }
}

    document.querySelector('md-tabs').addEventListener('click', (event) => {
    const tabs = document.querySelectorAll('md-primary-tab');
    const panels = document.querySelectorAll('.tab-panel');

    // Get the index of the clicked tab
    const activeIndex = [...tabs].indexOf(event.target);

    // Update active tab and panel
    tabs.forEach((tab, index) => {
    tab.setAttribute('selected', index === activeIndex);
    panels[index].style.display = index === activeIndex ? 'block' : 'none';
});
});

