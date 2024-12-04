document.getElementById('showTableBtn').addEventListener('click', function() {
    const tableContainer = document.getElementById('tableContainer');
    if (tableContainer.style.display === 'none') {
        tableContainer.style.display = 'block';
        this.textContent = 'Hide History';
    } else {
        tableContainer.style.display = 'none';
        this.textContent = 'Show History';
    }
});
function saveInputs() {
    const startValue = parseInt(document.getElementById('startInput').value);
    const endValue = parseInt(document.getElementById('endInput').value);
    const randomNumber = Math.floor(Math.random() * (endValue - startValue + 1)) + startValue;

    // Get the table body element
    const tableBody = document.getElementById('resultsTable');


    // Remove 'is-selected' from any previously selected row
    const selectedRow = tableBody.querySelector('.is-selected');
    if (selectedRow) {
        selectedRow.classList.remove('is-selected');
    }

    // Create a new table row
    const newRow = tableBody.insertRow();
    newRow.classList.add('is-selected'); // Add the 'is-selected' class

    // Create table cells for each value
    const startCell = newRow.insertCell();
    const endCell = newRow.insertCell();
    const randomCell = newRow.insertCell();

    // Set the content of the cells
    startCell.textContent = startValue;
    endCell.textContent = endValue;
    randomCell.textContent = randomNumber;
    // Save data to cookies
    saveDataToCookies(startValue, endValue, randomNumber);

}

function saveDataToCookies(start, end, random) {
    // Get existing cookie data or initialize an empty array
    let storedData = getCookieData();

    // Add new data as an object
    storedData.push({ start, end, random });

    // Convert data to JSON string and store in cookie
    document.cookie = `randomData=${JSON.stringify(storedData)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
}

function getCookieData() {
    // Get the cookie value
    const cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)randomData\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    // Parse and return the data, or an empty array if no cookie exists
    return cookieValue ? JSON.parse(cookieValue) : [];
}

// Load data from cookies on page load (optional)
window.onload = () => {
    const storedData = getCookieData();
    const tableBody = document.getElementById('resultsTable');

    storedData.forEach(data => {
        const newRow = tableBody.insertRow();
        newRow.insertCell().textContent = data.start;
        newRow.insertCell().textContent = data.end;
        newRow.insertCell().textContent = data.random;
    });
};
function clearAll() {
    // Clear the cookie
    document.cookie = "randomData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Clear the table
    const tableBody = document.getElementById('resultsTable');
    tableBody.innerHTML = ''; // This removes all rows from the table body
}