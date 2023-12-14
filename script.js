let userRights = 0;
let transactions = [];

function updateRemainingRightsDisplay() {
    document.getElementById('remainingRights').value = userRights.toFixed(2);
}
function createDayElement(day) {
    let dayElement = document.createElement('div');
    dayElement.innerText = day;
    dayElement.className = 'day';
    dayElement.addEventListener('click', () => openDayPopup(day));
    return dayElement;
}

function openDayPopup(day) {
    document.getElementById('selectedDay').textContent = day;
    populateDailyTransactionList(day); 
    document.getElementById('dailyTransactionPopup').style.display = 'block';
}

function closeDayPopup() {
    document.getElementById('dailyTransactionPopup').style.display = 'none';
    document.getElementById('transactionName').value = '';
    document.getElementById('transactionAmount').value = '';
}
document.addEventListener('DOMContentLoaded', function() {
    populateMonthOptions();
    populateYearOptions();
    populateDays();
    document.getElementById('saveTransaction').addEventListener('click', saveTransaction);
    document.querySelector('.closeDailyTransaction').addEventListener('click', closeDayPopup);
});
function saveTransaction() {
    const day = parseInt(document.getElementById('selectedDay').textContent);
    const month = parseInt(document.getElementById('selectedMonth').value) - 1; // JavaScript months are 0-indexed
    const year = parseInt(document.getElementById('selectedYear').value);

    const name = document.getElementById('transactionName').value;
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const transactionType = document.getElementById('transactionType').value;

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid transaction amount.");
        return;
    }

    const adjustedAmount = transactionType === "spent" ? -amount : amount;
    if (transactionType === "earned") {
        userRights += amount;
    } else {
        userRights -= amount;
    }

    updateRemainingRightsDisplay();

    const transactionDate = new Date(year, month, day);
    const transaction = { date: transactionDate, name, amount: adjustedAmount };
    transactions.push(transaction);

    addToDailyTransactionsList(name, adjustedAmount);
    updateDoneTransactionsDisplay();
    document.getElementById('transactionName').value = '';
    document.getElementById('transactionAmount').value = '';
}
function populateYearOptions() {
    const yearSelect = document.getElementById('selectedYear');
    for (let year = 2018; year <= 2024; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}
function populateMonthOptions() {
    const monthSelect = document.getElementById('selectedMonth');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
}
function populateDays(month, year) {
    const daysContainer = document.getElementById('dailyTransactions');
    daysContainer.innerHTML = ''; // Clear existing content
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'weekday-header';
        dayHeader.innerText = day;
        daysContainer.appendChild(dayHeader);
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    const startDay = new Date(year, month - 1, 1).getDay();

    for (let i = 0; i < startDay; i++) {
        const emptyDayElement = document.createElement('div');
        emptyDayElement.className = 'day empty';
        daysContainer.appendChild(emptyDayElement);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        daysContainer.appendChild(createDayElement(i));
    }
}
document.getElementById('generateCalendar').addEventListener('click', () => {
    const selectedMonth = parseInt(document.getElementById('selectedMonth').value);
    const selectedYear = parseInt(document.getElementById('selectedYear').value);
    populateDays(selectedMonth, selectedYear);
});
function openFixedCostsPopup() {
    document.getElementById('fixedCostsPopup').style.display = 'block';
}

function closeFixedCostsPopup() {
    document.getElementById('fixedCostsPopup').style.display = 'none';
}

function addFixedCost() {
    const name = document.getElementById('fixedCostName').value;
    const amount = parseFloat(document.getElementById('fixedCostAmount').value);

    if (!isNaN(amount) && amount > 0) {
        const month = parseInt(document.getElementById('selectedMonth').value) - 1;
        const year = parseInt(document.getElementById('selectedYear').value);

        const costDate = new Date(year, month, 1);

        userRights -= amount;
        updateRemainingRightsDisplay();

        const transaction = { date: costDate, name, amount: -amount, isFixedCost: true };
        transactions.push(transaction);

        addToFixedExpensesList(name, -amount);
        updateDoneTransactionsDisplay();
    } else {
        alert("Please enter a valid amount.");
    }
    document.getElementById('fixedCostName').value = '';
    document.getElementById('fixedCostAmount').value = '';
}

function addToDailyTransactionsList(name, amount) {
    const listDiv = document.getElementById('dailyTransactionsList');
    const transactionDiv = document.createElement('div');
    transactionDiv.className = 'transaction-item';
    transactionDiv.textContent = `${name}: ${amount.toFixed(2)}`;
    listDiv.appendChild(transactionDiv);
}
document.getElementById('exportTransactions').addEventListener('click', exportTransactions);
function exportTransactions() {
    let transactionsText = `Remaining User Rights: ${userRights.toFixed(2)}\n\n`;
    transactionsText += "List of your transactions:\n";

    transactions.forEach(t => {
        let transactionDetails;
        if (t.isFixedCost) {
            transactionDetails = `Fixed Cost - Name : ${t.name}, Amount: ${t.amount.toFixed(2)}`;
        } else {
            let formattedDate = `${t.date.getDate()}/${t.date.getMonth() + 1}/${t.date.getFullYear()}`;
            transactionDetails = `Daily transaction - Date: ${formattedDate}, Name: ${t.name}, Amount: ${t.amount.toFixed(2)}`;
        }

        transactionsText += transactionDetails + "\n";
    });

    const blob = new Blob([transactionsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.getElementById('userRights').addEventListener('change', (e) => {
    userRights = parseFloat(e.target.value);
    updateRemainingRightsDisplay();
});

function populateDailyTransactionList(day) {
    const listDiv = document.getElementById('dailyTransactionsList');
    listDiv.innerHTML = ''; 
    transactions.filter(t => t.day === day.toString()).forEach(t => {
        const transactionDiv = document.createElement('div');
        transactionDiv.className = 'transaction-item';
        transactionDiv.textContent = `${t.name}: ${t.amount.toFixed(2)}`;
        listDiv.appendChild(transactionDiv);
    });
}
function addToFixedExpensesList(name, amount) {
    const listDiv = document.getElementById('fixedExpensesList');
    const expenseDiv = document.createElement('div');
    expenseDiv.className = 'expense-item';
    expenseDiv.textContent = `${name}: ${amount.toFixed(2)}`;
    listDiv.appendChild(expenseDiv);
}

function updateDoneTransactionsDisplay() {
    const transactionsDiv = document.getElementById('doneTransactions');
    transactionsDiv.innerHTML = '';

    transactions.forEach(t => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';

        let formattedDate;
        if (t.isFixedCost) {
            formattedDate = `Fixed Cost `;
        } else {
            formattedDate = `${t.date.getDate()}/${t.date.getMonth() + 1}/${t.date.getFullYear()}`;
        }

        transactionElement.textContent = `${formattedDate}: ${t.name} - ${t.amount < 0 ? 'Spent' : 'Received'} ${Math.abs(t.amount).toFixed(2)}`;

        transactionsDiv.appendChild(transactionElement);
    });
}

document.getElementById('openFixedCostsPopup').addEventListener('click', openFixedCostsPopup);
document.querySelector('.closeFixedCosts').addEventListener('click', closeFixedCostsPopup);
document.getElementById('addFixedCost').addEventListener('click', addFixedCost);
