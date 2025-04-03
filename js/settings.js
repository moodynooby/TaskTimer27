document.addEventListener('DOMContentLoaded', function() {
    // Load saved settings
    loadSettings();
    
    // Theme radio buttons
    const themeRadios = document.querySelectorAll('input[name="theme-radios"]');
    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            applyTheme(this.value);
        });
    });
    
    // Custom theme
    document.getElementById('applyCustomTheme').addEventListener('click', function() {
        const customTheme = document.getElementById('customThemeInput').value.trim();
        if (customTheme) {
            applyTheme(customTheme);
        }
    });
    
    // Save settings
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    
    // Functions
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    function saveSettings() {
        const settings = {
            pomodoroLength: document.getElementById('pomodoroLengthInput').value,
            breakLength: document.getElementById('breakLengthInput').value,
            theme: document.querySelector('input[name="theme-radios"]:checked')?.value || 
                   document.getElementById('customThemeInput').value || 'default'
        };
        
        localStorage.setItem('taskTimerSettings', JSON.stringify(settings));
        alert('Settings saved successfully!');
    }
    
    function loadSettings() {
        const savedSettings = localStorage.getItem('taskTimerSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // Set timer values
            document.getElementById('pomodoroLengthInput').value = settings.pomodoroLength || 25;
            document.getElementById('breakLengthInput').value = settings.breakLength || 5;
            
            // Set theme
            const themeRadio = document.querySelector(`input[name="theme-radios"][value="${settings.theme}"]`);
            if (themeRadio) {
                themeRadio.checked = true;
            } else if (settings.theme) {
                document.getElementById('customThemeInput').value = settings.theme;
            }
            
            // Apply the theme
            applyTheme(settings.theme || 'default');
        }
    }
});
