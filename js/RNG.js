    // Initialize history from localStorage or empty array
    let history = JSON.parse(localStorage.getItem('rngHistory') || '[]');
    updateHistoryTable();

    document.getElementById('generateBtn').addEventListener('click', generateNumbers);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

    function generateNumbers() {
        const minValue = parseInt(document.getElementById('minValue').value);
        const maxValue = parseInt(document.getElementById('maxValue').value);
        const quantity = parseInt(document.getElementById('quantity').value);
        const resultContainer = document.getElementById('resultContainer');
        const numbersDiv = document.getElementById('numbers');

        // Hide results initially
        resultContainer.classList.add('hidden');

        // Generate random numbers using crypto
        const array = new Uint32Array(quantity);
        crypto.getRandomValues(array);

        const randomNumbers = Array.from(array).map(num =>
            Math.floor(num / (0xFFFFFFFF + 1) * (maxValue - minValue + 1) + minValue)
        );

        // Display results
        numbersDiv.innerHTML = '';
        randomNumbers.forEach(num => {
            const span = document.createElement('span');
            span.className = 'badge badge-lg';
            span.textContent = num;
            numbersDiv.appendChild(span);
        });

        // Show results
        resultContainer.classList.remove('hidden');

        // Save to history
        saveToHistory(minValue, maxValue, quantity, randomNumbers);
    }

    function saveToHistory(min, max, quantity, numbers) {
        const historyEntry = {
            timestamp: new Date().toISOString(),
            min: min,
            max: max,
            quantity: quantity,
            numbers: numbers
        };

        history.unshift(historyEntry); // Add to beginning of array
        if (history.length > 10) { // Keep only last 10 entries
            history.pop();
        }

        localStorage.setItem('rngHistory', JSON.stringify(history));
        updateHistoryTable();
    }

    function updateHistoryTable() {
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';

        history.forEach(entry => {
            const row = document.createElement('tr');

            // Format timestamp
            const date = new Date(entry.timestamp);
            const timeStr = date.toLocaleTimeString();

            row.innerHTML = `
                <td>${timeStr}</td>
                <td>${entry.min} - ${entry.max}</td>
                <td>${entry.quantity}</td>
                <td class="flex flex-wrap gap-1">
                    ${entry.numbers.map(n => `<span class="badge badge-sm">${n}</span>`).join('')}
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    function clearHistory() {
        history = [];
        localStorage.removeItem('rngHistory');
        updateHistoryTable();
    }
