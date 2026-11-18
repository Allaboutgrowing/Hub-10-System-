// ==================================
// HUB 01 — ONE SYSTEM™
// Main Application Engine
// ==================================


// DATABASE STORAGE

let suppliers = JSON.parse(localStorage.getItem("hub_suppliers") || "[]");

let purchases = JSON.parse(localStorage.getItem("hub_purchases") || "[]");

let inventory = JSON.parse(localStorage.getItem("hub_inventory") || "[]");

let sales = JSON.parse(localStorage.getItem("hub_sales") || "[]");

let finances = JSON.parse(localStorage.getItem("hub_finances") || "[]");


function saveData() {

    localStorage.setItem("hub_suppliers", JSON.stringify(suppliers));

    localStorage.setItem("hub_purchases", JSON.stringify(purchases));

    localStorage.setItem("hub_inventory", JSON.stringify(inventory));

    localStorage.setItem("hub_sales", JSON.stringify(sales));

    localStorage.setItem("hub_finances", JSON.stringify(finances));

}


function formatMoney(amount) {
    return "GH₵ " + Number(amount).toFixed(2);
}


function getDate() {
    return new Date().toLocaleDateString();
}


function addCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
}


function addDeleteButton(row, callback) {

    const cell = document.createElement("td");

    const button = document.createElement("button");

    button.textContent = "Delete";

    button.className = "delete-btn";

    button.addEventListener("click", callback);

    cell.appendChild(button);

    row.appendChild(cell);

}


// ==================================
// NAVIGATION
// ==================================

document.querySelectorAll(".nav-btn").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".nav-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        document.querySelectorAll(".page").forEach(page => {
            page.classList.remove("active");
        });

        button.classList.add("active");

        const page = button.dataset.page;

        document.getElementById(page).classList.add("active");

        document.getElementById("pageTitle").textContent =
            button.textContent;

    });

});


// ==================================
// SUPPLIER MANAGEMENT
// ==================================

document.getElementById("supplierForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const supplier = {

        id: Date.now(),

        name: document.getElementById("supplierName").value.trim(),

        phone: document.getElementById("supplierPhone").value.trim(),

        location: document.getElementById("supplierLocation").value.trim(),

        commodity: document.getElementById("supplierCommodity").value.trim()

    };

    suppliers.push(supplier);

    saveData();

    this.reset();

    renderSuppliers();

    updateDashboard();

    alert("Supplier registered successfully!");

});


function renderSuppliers(search = "") {

    const list = document.getElementById("supplierList");

    list.innerHTML = "";

    const filtered = suppliers.filter(s =>

        [s.name, s.phone, s.location, s.commodity]

            .some(value => value.toLowerCase().includes(search.toLowerCase()))

    );

    filtered.forEach(supplier => {

        const row = document.createElement("tr");

        addCell(row, supplier.name);

        addCell(row, supplier.phone);

        addCell(row, supplier.location);

        addCell(row, supplier.commodity);

        addDeleteButton(row, () => {

            suppliers = suppliers.filter(s => s.id !== supplier.id);

            saveData();

            renderSuppliers();

            renderSupplierOptions();

            updateDashboard();

        });

        list.appendChild(row);

    });

}


document.getElementById("supplierSearch").addEventListener("input", function() {

    renderSuppliers(this.value);

});


// ==================================
// PROCUREMENT MANAGEMENT
// ==================================

function renderSupplierOptions() {

    const select = document.getElementById("purchaseSupplier");

    select.innerHTML = '<option value="">Select Supplier</option>';

    suppliers.forEach(supplier => {

        const option = document.createElement("option");

        option.value = supplier.id;

        option.textContent = supplier.name;

        select.appendChild(option);

    });

}


document.getElementById("purchaseForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const supplierId = Number(document.getElementById("purchaseSupplier").value);

    const supplier = suppliers.find(s => s.id === supplierId);

    if (!supplier) {

        alert("Please select a valid supplier.");

        return;

    }

    const commodity = document.getElementById("purchaseCommodity").value.trim();

    const quantity = Number(document.getElementById("purchaseQuantity").value);

    const cost = Number(document.getElementById("purchaseCost").value);

    if (!Number.isFinite(quantity) || !Number.isFinite(cost) ||
        quantity <= 0 || cost <= 0) {

        alert("Enter valid purchase quantities and costs.");

        return;

    }

    purchases.push({

        id: Date.now(),

        supplier: supplier.name,

        commodity,

        quantity,

        cost,

        date: getDate()

    });

    // Add purchased commodity to inventory

    let item = inventory.find(i =>

        i.commodity.toLowerCase() === commodity.toLowerCase()

    );

    if (item) {

        item.quantity += quantity;

    } else {

        inventory.push({

            id: Date.now() + 1,

            commodity,

            quantity,

            location: "Receiving"

        });

    }

    // Record purchase as a financial expense

    finances.push({

        id: Date.now() + 2,

        type: "expense",

        description: "Procurement: " + commodity,

        amount: cost,

        date: getDate()

    });

    saveData();

    this.reset();

    renderPurchases();

    renderInventory();

    renderFinance();

    updateDashboard();

    alert("Purchase recorded successfully!");

});


function renderPurchases() {

    const list = document.getElementById("purchaseList");

    list.innerHTML = "";

    purchases.forEach(p => {

        const row = document.createElement("tr");

        addCell(row, p.supplier);

        addCell(row, p.commodity);

        addCell(row, p.quantity);

        addCell(row, formatMoney(p.cost));

        addCell(row, p.date);

        list.appendChild(row);

    });

}


// ==================================
// INVENTORY MANAGEMENT
// ==================================

document.getElementById("inventoryForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const commodity = document.getElementById("stockCommodity").value.trim();

    const quantity = Number(document.getElementById("stockQuantity").value);

    const location = document.getElementById("stockLocation").value.trim();

    if (!Number.isFinite(quantity) || quantity <= 0) {

        alert("Enter a valid stock quantity.");

        return;

    }

    let item = inventory.find(i =>

        i.commodity.toLowerCase() === commodity.toLowerCase()

    );

    if (item) {

        item.quantity += quantity;

        item.location = location;

    } else {

        inventory.push({

            id: Date.now(),

            commodity,

            quantity,

            location

        });

    }

    saveData();

    this.reset();

    renderInventory();

    updateDashboard();

    alert("Inventory updated successfully!");

});


function renderInventory() {

    const list = document.getElementById("inventoryList");

    list.innerHTML = "";

    inventory.forEach(item => {

        const row = document.createElement("tr");

        addCell(row, item.commodity);

        addCell(row, item.quantity);

        addCell(row, item.location);

        list.appendChild(row);

    });

}


// ==================================
// SALES & ORDERS
// ==================================

document.getElementById("salesForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const customer = document.getElementById("customerName").value.trim();

    const commodity = document.getElementById("saleCommodity").value.trim();

    const quantity = Number(document.getElementById("saleQuantity").value);

    const amount = Number(document.getElementById("saleAmount").value);

    if (!Number.isFinite(quantity) || !Number.isFinite(amount) ||
        quantity <= 0 || amount <= 0) {

        alert("Enter valid sale quantities and amounts.");

        return;

    }

    const item = inventory.find(i =>

        i.commodity.toLowerCase() === commodity.toLowerCase()

    );

    if (!item || item.quantity < quantity) {

        alert("Insufficient inventory for this sale.");

        return;

    }

    item.quantity -= quantity;

    sales.push({

        id: Date.now(),

        customer,

        commodity,

        quantity,

        amount,

        date: getDate()

    });

    // Record sale as financial income

    finances.push({

        id: Date.now() + 1,

        type: "income",

        description: "Sale: " + commodity,

        amount,

        date: getDate()

    });

    saveData();

    this.reset();

    renderSales();

    renderInventory();

    renderFinance();

    updateDashboard();

    alert("Sale recorded successfully!");

});


function renderSales() {

    const list = document.getElementById("salesList");

    list.innerHTML = "";

    sales.forEach(sale => {

        const row = document.createElement("tr");

        addCell(row, sale.customer);

        addCell(row, sale.commodity);

        addCell(row, sale.quantity);

        addCell(row, formatMoney(sale.amount));

        addCell(row, sale.date);

        list.appendChild(row);

    });

}


// ==================================
// FINANCIAL MANAGEMENT
// ==================================

document.getElementById("financeForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const type = document.getElementById("transactionType").value;

    const description = document.getElementById("transactionDescription").value.trim();

    const amount = Number(document.getElementById("transactionAmount").value);

    if (!Number.isFinite(amount) || amount <= 0) {

        alert("Enter a valid transaction amount.");

        return;

    }

    finances.push({

        id: Date.now(),

        type,

        description,

        amount,

        date: getDate()

    });

    saveData();

    this.reset();

    renderFinance();

    updateDashboard();

    alert("Financial transaction saved!");

});


function renderFinance() {

    const list = document.getElementById("financeList");

    list.innerHTML = "";

    finances.forEach(transaction => {

        const row = document.createElement("tr");

        addCell(row, transaction.type.toUpperCase());

        addCell(row, transaction.description);

        addCell(row, formatMoney(transaction.amount));

        addCell(row, transaction.date);

        list.appendChild(row);

    });

    const income = finances

        .filter(f => f.type === "income")

        .reduce((sum, f) => sum + f.amount, 0);

    const expenses = finances

        .filter(f => f.type === "expense")

        .reduce((sum, f) => sum + f.amount, 0);

    document.getElementById("totalIncome").textContent = formatMoney(income);

    document.getElementById("totalExpenses").textContent = formatMoney(expenses);

    document.getElementById("netBalance").textContent = formatMoney(income - expenses);

}


// ==================================
// DASHBOARD
// ==================================

function updateDashboard() {

    const income = finances

        .filter(f => f.type === "income")

        .reduce((sum, f) => sum + f.amount, 0);

    const expenses = finances

        .filter(f => f.type === "expense")

        .reduce((sum, f) => sum + f.amount, 0);

    document.getElementById("dashSuppliers").textContent = suppliers.length;

    document.getElementById("dashInventory").textContent = inventory.length;

    document.getElementById("dashSales").textContent =

        formatMoney(sales.reduce((sum, s) => sum + s.amount, 0));

    document.getElementById("dashBalance").textContent =

        formatMoney(income - expenses);

}


// ==================================
// INITIALIZE SYSTEM
// ==================================

function initializeSystem() {

    renderSuppliers();

    renderSupplierOptions();

    renderPurchases();

    renderInventory();

    renderSales();

    renderFinance();

    updateDashboard();

}

initializeSystem();
