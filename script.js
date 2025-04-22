const apiUrl = "https://script.google.com/macros/s/AKfycbzhpA6EIQ44KcBAhMGcRLjgzvSIbhQogo5BZBI01_ODk9K3pV0PdSok65xYAIpXZc4/exec"; // Replace with your Apps Script URL

const colorPalletes = ["#ecf5fc", "#e8f7e6", "#fceced", "#fff8dc"];
let currentPage = 1;
const ITEMS_PER_PAGE = 50; // Number of items per 
let transactionData = [];
let isEditing = false; // Flag to check if we are editing
let editingRowNumber = null; // Row number to edit

async function fetchData() {
    try {
        const response = await fetch(`${apiUrl}?action=getTransaction`); // Replace with your Web App URL
        transactionData = await response.json();
        //console.log(data);
        TransactionPage(currentPage)
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
// Function to render a page of data
function TransactionPage(page) {
    const container = document.getElementById('transaction-list');
    container.innerHTML = ''; // Clear current content

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const currentPageData = transactionData.slice(start, end);

    currentPageData.forEach(transaction => {
        let category = getCategoryDetails(transaction.spendCategory)

        container.innerHTML += `
          <div class="media hlp">
            <figure class="media-left">
              <span class="icon ${category.color}">
                ${category.icon}
              </span>
            </figure>
            <div class="media-content">
              <p class="title is-6 one-line">${capitalizeFirstLetter(transaction.item)}</p>
              <p class="subtitle is-7 one-line">
                Date: ${formatDateToDDMMYY(transaction.date)} 
                <span class="has-text-grey">| Card: ${transaction.card}</span>
              </p>
            </div>
            <div class="media-right">
              <p class="has-text-weight-bold">${formatAmountInINR(transaction.amount)}</p>
            </div>
          </div>
          <hr>
        `;
    });

    renderPagination(page); // Render pagination controls
}

// Function to render pagination controls
function renderPagination(activePage) {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = ''; // Clear current controls

    const totalPages = Math.ceil(transactionData.length / ITEMS_PER_PAGE);

    for (let i = 1; i <= totalPages; i++) {
        paginationControls.innerHTML += `
          <button class="button ${i === activePage ? 'is-primary' : ''}" onclick="changePage(${i})">
            ${i}
          </button>
        `;
    }
}

// Function to handle page change
function changePage(page) {
    currentPage = page;
    TransactionPage(page);
}

function showSection(sectionId, navId) {

    // Hide all sections
    const sections = document.querySelectorAll('.section');
    const links = document.querySelectorAll('.nav-item');
    sections.forEach(section => section.classList.remove('active'));
    links.forEach(link => link.classList.remove('active'));
    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    const selectedNav = document.getElementById(navId);
    selectedSection.classList.add('active');
    selectedNav.classList.add('active');
}
function renderDashboard(data) {
    const container = document.getElementById('dashboard-content');

}
async function loadDashboardData(tableId) {
    let editData = {}
    try {
        const response = await fetch(`${apiUrl}?action=getDashboard`);
        const data = await response.json();
        const dashboardContent = document.getElementById("dashboard-content");
        dashboardContent.innerHTML = ""; // Clear existing content

        const tableBody = document.getElementById(tableId);
        tableBody.innerHTML = ""; // Clear table contents before adding new rows
        //console.log(data);
        data.cards.forEach((card, index) => {
            const tr = document.createElement("tr");
            const td = document.createElement("td");

            dashboardContent.innerHTML += `
    <div class="column is-half">
          <div class="card-details">
            <div class="card-title">${card.name}</div>
            <div class="data-item">
              <span class="data-item-title">Utilized:</span>
              <span class="data-item-value">${formatAmountInINR(card.utilized)}</span>
              <span>(${utilizedPercent(card.utilized, card.total)}%)</span>
            </div>
            <div class="data-item">
              <span class="data-item-title">Avai. Limit:</span>
              <span class="data-item-value">${formatAmountInINR(card.remaining)}</span>
            </div>
            <div class="data-item">
              <span class="data-item-title">Credit Limit:</span>
              <span class="data-item-value">${formatAmountInINR(card.total)}</span>
            </div>
          </div>
        </div>
    `
            editData = { cardNumber: card.name.split("-")[1], bankName: card.name.split("-")[0], cardLimit: card.total }
            tableBody.innerHTML += `
    <tr>
    <td class="is-size-7-mobile">${card.name}</td>
    <td class="is-size-7-mobile">${card.total}</td>
    <td class="is-size-7-mobile">${card.utilized}</td>
    <td class="is-size-7-mobile">${card.remaining}</td>
    <td class="is-size-7-mobile">
      <button class="button is-small is-warning is-size-7-mobile" onclick="editData('Credit Card', ${index + 2},${JSON.stringify(editData).replace(/"/g, '&quot;')} )"><i class="fas fa-edit"> </i></button>
      <button class="button is-small is-danger" onclick="deleteData('Credit Card', ${index + 2})"><i class="fas fa-trash"> </i></button>
    </td>
      </tr>
    `
        });
        //console.log(editData);
        const cardDetails = document.querySelectorAll('.card-details');
        cardDetails.forEach((cardDetail, index) => {
            cardDetail.style.backgroundColor = colorPalletes[index];
        })
    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
}

function getCategoryDetails(category) {
    if (typeof category !== "string") {
        return {
            icon: '<i class="fas fa-question"></i>',
            color: "has-text-dark"
        };
    }

    const formattedCategory = category.toLowerCase().trim().replace(/\s+/g, " ");

    const categoryMap = {
        "recurring": { icon: '<i class="fas fa-arrows-rotate"></i>', color: "has-text-danger" },
        "medical": { icon: '<i class="fas fa-notes-medical"></i>', color: "has-text-info" },
        "periodic": { icon: '<i class="fas fa-calendar-alt"></i>', color: "has-text-primary" },
        "non-essential": { icon: '<i class="fas fa-shopping-bag"></i>', color: "has-text-warning" }
    };

    return categoryMap[formattedCategory] || { icon: '<i class="fas fa-question"></i>', color: "has-text-dark" };
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function formatAmountInINR(amount) {

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}


function handleModal(modalId, action) {
    const modal = document.getElementById(modalId);
    const form = document.getElementById(`${modalId.toLowerCase().replace("modal", "form")}`);

    if (modal) {
        if (action === 'open') {
            modal.classList.add('is-active');
        } else if (action === 'close') {
            modal.classList.remove('is-active');
            isEditing = false;
            form.reset()
        }
    }
    console.log("isEditing" + isEditing);

}

// Event listeners for opening modals
document.querySelectorAll('[data-modal]').forEach(button => {
    button.addEventListener('click', function () {
        const modalId = this.getAttribute('data-modal');
        handleModal(modalId, 'open');
    });
});

// Event listeners for closing modals
document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', function () {
        const modalId = this.getAttribute('data-close');
        handleModal(modalId, 'close');
    });
});

// Close modal on background click
document.querySelectorAll('.modal-background').forEach(background => {
    background.addEventListener('click', function () {
        const modal = this.closest('.modal');
        if (modal) {
            handleModal(modal.id, 'close');
        }
    });
});

// Helper Function: Display Messages
function showMessage(messageBox, type, message) {
    messageBox.className = `notify ${type}`;
    messageBox.textContent = message;
    messageBox.style.visibility = "visible";
    setTimeout(() => {
        messageBox.style.visibility = "hidden";
    }, 3000);
}

function submitData(module, formId) {
    const form = document.getElementById(formId);
    var formData = new FormData(form);
    const action = isEditing ? "edit" : "add";

    if (formId === 'credit-card-form') {
        var data = Object.fromEntries(formData.entries())
        const card = `${data.bankName}-${data.cardNumber}`
        const utilized = 0;
        var rem = 0;

        if (isEditing) {
            rem = `=IF(A${editingRowNumber}<>"",B${editingRowNumber}-D${editingRowNumber})`
            data = { card, ...data, rem }
        } else {
            data = { card, ...data, rem, utilized }
        }
        delete data.cardNumber;
        delete data.bankName;


        console.log("datasubmit:" + JSON.stringify(data, null));
    } else {
        var data = {}
        // Convert form data into JSON object
        formData.forEach((value, key) => {
            data[key] = value;
        });
        console.log("datasubmit:" + JSON.stringify(data, null));
    }
    // Object.assign(data, { utilized: 100, rem: '=IF(A3<>"",C3-D3,"")' })
    // console.log("daaaa: " + data);
    try {
        if (isEditing) {
            data.rowNumber = editingRowNumber; // Include the row number for editing
        }
        fetch(apiUrl, {
            redirect: "follow",
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify({ action, module, data }),
        });

        form.reset();
        isEditing = false;
        // alert(`${module} data added successfully!`);
        // loadTableData(module, `${module.toLowerCase().replace(" ", "-")}-table`);
        alert(`${module} data ${isEditing ? "updated" : "added"} successfully!`);
        //console.log(`${module.toLowerCase().replace(" ", "-")}-table`);
        console.log("modal id:" + `${module.toLowerCase().replace(" ", "-")}-modal`);
        if (formId === 'credit-card-form') {
            loadDashboardData("credit-card-table")
        } else {
            loadTableData(module, `${module.toLowerCase().replace(" ", "-")}-table`, module);
        }
        handleModal(`${module.toLowerCase().replace(" ", "-")}-modal`, 'close')

    } catch (error) {
        console.error(`Error adding data to ${module}:`, error);
    }
}

// Edit Data Function
window.editData = function (module, rowNumber, rowData) {
    isEditing = true;
    editingRowNumber = rowNumber; // Save row number for editing
    const formId = `${module.toLowerCase().replace(" ", "-")}-form`;
    const form = document.getElementById(formId);
    console.log(module);
    console.log(rowData);
    console.log("Row Data Keys:", Object.keys(rowData));
    // Populate the form fields with the existing data
    Object.keys(rowData).forEach((key) => {
        if (form.elements[key]) {
            form.elements[key].value = rowData[key];
        }
    });

    // Open the corresponding modal
    //modals[module.toLowerCase().replace("s", "")].classList.add("is-active");
    handleModal(`${module.toLowerCase().replace(" ", "-")}-modal`, 'open')
}

function deleteData(module, rowNumber) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
        fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify({ action: "delete", module, data: { rowNumber } }),
        });
        alert(`${module} data deleted successfully!`);
        if (module === 'Profile') {
            loadTableData(module, `${module.toLowerCase().replace(" ", "-")}-table`);
        } else {
            loadDashboardData(`${module.toLowerCase().replace(" ", "-")}-table`)
        }

    } catch (error) {
        console.error(`Error deleting data from ${module}:`, error);
    }
}

// Attach the functions to the global scope:
// window.editData = editData;
window.deleteData = deleteData;

// Form Submission Handlers
document.getElementById("saveProfileButton").addEventListener("click", (e) => {
    e.preventDefault();
    submitData("Profile", "profile-form");
    // handleModal(modalId, 'close');
});

document.getElementById("saveCreditCardButton").addEventListener("click", (e) => {
    e.preventDefault();
    submitData("Credit Card", "credit-card-form");
});

// document.getElementById("transaction-form").addEventListener("submit", (e) => {
//   e.preventDefault();
//   submitData("Transactions", "transaction-form");
//   //modals.transaction.classList.remove("is-active");
// });

function loadTableData(module, tableId) {
    fetch(`${apiUrl}?action=get&module=${module}`)
        .then(response => response.json())
        .then(data => {
            //const { transactions, creditCards, profiles } = data
            const tableBody = document.getElementById(tableId);
            tableBody.innerHTML = ""; // Clear table contents before adding new rows

            data.forEach((row, index) => {
                const tr = document.createElement("tr");
                Object.values(row).forEach((value) => {
                    const td = document.createElement("td");
                    td.textContent = value;
                    tr.appendChild(td);
                });

                // Add Edit and Delete buttons
                const actionTd = document.createElement("td");
                actionTd.innerHTML = `
                    <button class="button is-small is-warning" onclick="editData('${module}', ${index + 2},${JSON.stringify(row).replace(/"/g, '&quot;')} )"><i class="fas fa-edit"> </i></button>
                    <button class="button is-small is-danger" onclick="deleteData('${module}', ${index + 2})"><i class="fas fa-trash"> </i></button>
                `;
                tr.appendChild(actionTd);

                tableBody.appendChild(tr);
            })
        })

        .catch(error => {
            console.error("Error loading data:", error);
            document.getElementById('error-message').classList.remove('is-hidden');
        });
}

// Fetch Card Numbers for Transaction Form
function fetchCardNumbers() {
    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        },
        // Send the action in the request body.
        body: JSON.stringify({ action: "getCards" })

    }).then(function (response) {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
        .then(function (data) {
            console.log(data);

            data.data.forEach(function (card) {
                const option = document.createElement('option');
                option.value = card;
                option.textContent = card;
                transactionCardDropdown.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching card numbers:", error));
}

function formattedDate() {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0'); // Ensures two digits
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month starts from 0
    const year = String(currentDate.getFullYear()).slice(-2); // Gets last two digits of the year

    const formattedDate = `${day}-${month}-${year}`;
    //console.log(formattedDate); // Outputs something like "14-04-25"
    return formattedDate;
}

function formatDateToDDMMYY(isoTimestamp) {
    // Create a Date object from the ISO timestamp
    let date = new Date(isoTimestamp);

    // Convert to IST (UTC+5:30)
    date.setMinutes(date.getMinutes() + 330);

    // Extract day, month, and year
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    let year = String(date.getFullYear()).slice(-2);

    return `${day}-${month}-${year}`;
}
function utilizedPercent(utilized, limit) {
    const utilizedPer = utilized / limit * 100;
    return Math.floor(utilizedPer);
}

const secondSetData = [
    { item: "Recurring", icon: "fas fa-sync" },
    { item: "Medical", icon: "fas fa-credit-card" },
    { item: "Periodic", icon: "fas fa-wallet" },
    { item: "Non-essential", icon: "fas fa-wallet" }
];

// Define light pastel colors for the buttons
const colorMap = ["#e6f7ff", "#fef6e4", "#f3e9f7", "#fff8e6", "#f0fff4"];

const selectedLabel = document.getElementById('selected-label');
const buttonSet1 = document.getElementById('button-set-1');
const buttonSet2 = document.getElementById('button-set-2');
const formContainer = document.getElementById('form-container');
const backButton = document.getElementById('back-button');
const submitButton = document.getElementById('submit-button');
const item = document.getElementById('input-item');
const amount = document.getElementById('input-amount');

let selectedItems = { firstSet: null, secondSet: null }; // Separate selections into categories

// Create dynamic buttons
function createButtons(data, container, onClick) {
    container.innerHTML = ""; // Clear existing buttons

    data.forEach((item, index) => {
        var cardIcon = getCardIcon(item.item)
        const button = document.createElement('button');
        button.className = 'button custom-button';
        button.style.backgroundColor = colorMap[index % colorMap.length]; // Assign light color

        const iconSpan = document.createElement('i');
        iconSpan.className = cardIcon;

        const textSpan = document.createElement('span');
        textSpan.innerText = item.item;

        button.appendChild(iconSpan);
        button.appendChild(textSpan);

        button.addEventListener('click', () => onClick(item));
        container.appendChild(button);
    });
}

// Display second set and update selection for the first set
function handleFirstSetClick(item) {
    selectedItems.firstSet = item.item; // Assign first set selection
    updateSelectedLabel();
    buttonSet1.classList.add('hidden');
    buttonSet2.classList.remove('hidden');
    backButton.classList.remove('hidden');
}

// Update selection for the second set
function handleSecondSetClick(item) {
    selectedItems.secondSet = item.item; // Assign second set selection
    updateSelectedLabel();
    buttonSet2.classList.add('hidden');
    formContainer.classList.remove('hidden');
}

// Update the "Selected" label
function updateSelectedLabel() {
    const selections = [];
    if (selectedItems.firstSet) selections.push(selectedItems.firstSet);
    if (selectedItems.secondSet) selections.push(selectedItems.secondSet);
    selectedLabel.innerText = selections.length > 0
        ? `Selected: ${selections.join(" -> ")}`
        : "Selected: None";
}

// Go back to the previous set
function handleBackClick() {
    if (!formContainer.classList.contains('hidden')) {
        formContainer.classList.add('hidden');
        buttonSet2.classList.remove('hidden');
        backButton.classList.remove('hidden'); // Ensure Back button reappears
        selectedItems.secondSet = null; // Clear second set selection
    } else {
        buttonSet1.classList.remove('hidden');
        buttonSet2.classList.add('hidden');
        selectedItems.firstSet = null; // Clear first set selection
        backButton.classList.add('hidden');
    }
    updateSelectedLabel();
}

function goTofirstPage() {
    if (!formContainer.classList.contains('hidden')) {
        formContainer.classList.add('hidden');
        buttonSet1.classList.remove('hidden');
        backButton.classList.remove('hidden'); // Ensure Back button reappears
        selectedItems.secondSet = null; // Clear second set selection
        selectedItems.firstSet = null;
    }
    updateSelectedLabel();
}

function getCardIcon(card) {

    if (typeof card !== "string") {
        return "fas fa-coin"; // Default icon if card isn't valid
    }
    //console.log(card);

    switch (card.trim().replace(/\s+/g, " ").split("-")[0].toLowerCase()) {

        case 'sbi': return 'fas fa-money-check';
        case 'hdfc': return 'fas fa-credit-card';
        case 'axis': return 'fas fa-wallet';
        case 'icici': return 'fas fa-money-bill';
        case 'recurring': return 'fas fa-sync';
        case 'medical': return 'fas fa-notes-medical';
        case 'periodic': return 'fas fa-calendar-alt';
        case 'non': return 'fas fa-shopping-bag';
        default: return 'fas fa-question';
    };
}

// Submit the form data along with selections
submitButton.addEventListener('click', () => {
    saveTransactionData('Credit Card')
    //console.log("Submitting Data: ", formData); // Replace with app script submission logic

});
function formattedDate() {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0'); // Ensures two digits
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month starts from 0
    const year = String(currentDate.getFullYear()).slice(-2); // Gets last two digits of the year

    const formattedDate = `${month}/${day}/${year}`;
    //console.log(formattedDate); // Outputs something like "14-04-25"
    return formattedDate;
}


// Add back button functionality
backButton.addEventListener('click', handleBackClick);

// Fetch Card Numbers for Transaction Form
function saveTransactionData(module) {
    if (item.value === "" || amount.value === "") {
        return false;
    }
    const data = {
        date: formattedDate(),
        card: selectedItems.firstSet,
        item: item.value,
        category: selectedItems.secondSet,
        amount: amount.value
    };
    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        },
        // Send the action in the request body.
        body: JSON.stringify({ action: "add", module: 'Transaction', data })

    }).then(function (response) {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        alert('Transaction data saved successfully..!')
        loadTableData(module, `${module.toLowerCase().replace(" ", "-")}-table`);
        loadDashboardData(`${module.toLowerCase().replace(" ", "-")}-table`)

        goTofirstPage()
    })
        .catch(error => console.error("Error fetching card numbers:", error))
}

async function getButtonsData() {
    var firstSetData = {}
    try {
        const response = await fetch(`${apiUrl}?action=getCards`);
        var data = await response.json();
        // Generate buttons
        createButtons(data, buttonSet1, handleFirstSetClick);

    } catch (error) {
        console.error("Error loading button data:", error);
    }
}
createButtons(secondSetData, buttonSet2, handleSecondSetClick);
getButtonsData()

loadDashboardData("credit-card-table")
// Load data for all modules
loadTableData("Profile", "profile-table");
// loadTableData("Credit Cards", "credit-cards-table");
window.onload = fetchData;