/* =====================================================
   HUB 01 ONE SYSTEM™
   EV EMPIRE VENTURES
   VERSION 2.0 — APPLICATION ENGINE
===================================================== */

"use strict";


/* =====================================================
   1. DATABASE CONFIGURATION
===================================================== */

const STORAGE_KEY = "hub01_database_v1";

const COLLECTIONS = [
    "buyers",
    "suppliers",
    "procurement",
    "receiving",
    "inventory",
    "production",
    "sales",
    "logistics",
    "finance",
    "activity"
];

const EMPTY_DATABASE = {
    buyers: [],
    suppliers: [],
    procurement: [],
    receiving: [],
    inventory: [],
    production: [],
    sales: [],
    logistics: [],
    finance: [],
    activity: []
};

let database = loadDatabase();


/* =====================================================
   2. DATABASE FUNCTIONS
===================================================== */

function loadDatabase() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return structuredDatabaseCopy();
        }

        const parsed = JSON.parse(saved);

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return structuredDatabaseCopy();
        }

        const result = structuredDatabaseCopy();

        COLLECTIONS.forEach(collection => {
            if (Array.isArray(parsed[collection])) {
                result[collection] = parsed[collection];
            }
        });

        return result;

    } catch (error) {
        console.error("Database loading error:", error);
        return structuredDatabaseCopy();
    }
}


function structuredDatabaseCopy() {
    return JSON.parse(JSON.stringify(EMPTY_DATABASE));
}


function saveDatabase() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(database)
        );

        return true;

    } catch (error) {
        console.error("Database saving error:", error);

        showToast(
            "Unable to save data. Check your browser storage."
        );

        return false;
    }
}


function commitDatabase(message) {
    if (!saveDatabase()) {
        return false;
    }

    renderAll();

    if (message) {
        showToast(message);
    }

    return true;
}


/* =====================================================
   3. GENERAL HELPERS
===================================================== */

function generateId() {
    return (
        "H01-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random().toString(36).substring(2, 7).toUpperCase()
    );
}


function getValue(id) {
    const element = document.getElementById(id);

    return element ? element.value.trim() : "";
}


function getNumber(id) {
    const value = Number(getValue(id));

    return Number.isFinite(value) ? value : 0;
}


function formatMoney(value) {
    return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(value) || 0);
}


function formatNumber(value) {
    return new Intl.NumberFormat("en-GH", {
        maximumFractionDigits: 2
    }).format(Number(value) || 0);
}


function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return escapeHTML(value);
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function formatDateTime(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


function today() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function setHTML(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.innerHTML = value;
    }
}


function findRecord(collection, id) {
    return database[collection].find(
        record => record.id === id
    );
}


function totalOf(collection, property) {
    return database[collection].reduce(
        (total, record) => total + (Number(record[property]) || 0),
        0
    );
}


function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timeout);

    showToast.timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


/* =====================================================
   4. ACTIVITY LOGGING
===================================================== */

function logActivity(action, module) {
    database.activity.unshift({
        id: generateId(),
        action,
        module,
        date: new Date().toISOString()
    });

    database.activity = database.activity.slice(0, 100);
}


/* =====================================================
   5. MODULE CONFIGURATION
===================================================== */

const MODULES = {

    buyers: {
        form: "buyer-form",
        body: "buyer-records",
        name: "Market Intelligence",

        fields: {
            name: "buyer-name",
            contact: "buyer-contact",
            location: "buyer-location",
            product: "buyer-product",
            quantity: "buyer-quantity",
            price: "buyer-price",
            frequency: "buyer-frequency",
            type: "buyer-type"
        },

        columns: record => [
            escapeHTML(record.name),
            escapeHTML(record.location),
            escapeHTML(record.product),
            formatNumber(record.quantity) + " tonnes",
            formatMoney(record.price)
        ]
    },


    suppliers: {
        form: "supplier-form",
        body: "supplier-records",
        name: "Suppliers",

        fields: {
            name: "supplier-name",
            contact: "supplier-contact",
            location: "supplier-location",
            category: "supplier-category",
            product: "supplier-product",
            capacity: "supplier-capacity"
        },

        columns: record => [
            escapeHTML(record.name),
            escapeHTML(record.contact),
            escapeHTML(record.location),
            escapeHTML(record.category),
            escapeHTML(record.product)
        ]
    },


    procurement: {
        form: "procurement-form",
        body: "procurement-records",
        name: "Procurement",

        fields: {
            supplier: "procurement-supplier",
            product: "procurement-product",
            quantity: "procurement-quantity",
            price: "procurement-price",
            date: "procurement-date",
            reference: "procurement-reference"
        },

        columns: record => [
            escapeHTML(record.reference || "—"),
            escapeHTML(record.supplierName),
            escapeHTML(record.product),
            formatNumber(record.quantity) + " tonnes",
            formatMoney(record.total),
            formatDate(record.date)
        ]
    },


    receiving: {
        form: "receiving-form",
        body: "receiving-records",
        name: "Receiving",

        fields: {
            supplier: "receiving-supplier",
            product: "receiving-product",
            gross: "receiving-gross",
            rejected: "receiving-rejected",
            grade: "receiving-grade",
            date: "receiving-date"
        },

        columns: record => [
            escapeHTML(record.supplierName),
            escapeHTML(record.product),
            formatNumber(record.gross) + " tonnes",
            formatNumber(record.rejected) + " tonnes",
            formatNumber(record.accepted) + " tonnes",
            escapeHTML(record.grade),
            formatDate(record.date)
        ]
    },


    inventory: {
        form: "inventory-form",
        body: "inventory-records",
        name: "Inventory",

        fields: {
            product: "inventory-product",
            quantity: "inventory-quantity",
            location: "inventory-location",
            batch: "inventory-batch",
            minimum: "inventory-minimum"
        },

        columns: record => {
            const status = Number(record.quantity) <= Number(record.minimum)
                ? "Low Stock"
                : "Available";

            return [
                escapeHTML(record.product),
                formatNumber(record.quantity) + " tonnes",
                escapeHTML(record.location),
                escapeHTML(record.batch || "—"),
                escapeHTML(status)
            ];
        }
    },


    production: {
        form: "production-form",
        body: "production-records",
        name: "Production",

        fields: {
            batch: "production-batch",
            product: "production-product",
            input: "production-input",
            output: "production-output",
            date: "production-date",
            status: "production-status"
        },

        columns: record => {
            const yieldPercentage = record.input > 0
                ? (record.output / record.input) * 100
                : 0;

            return [
                escapeHTML(record.batch),
                escapeHTML(record.product),
                formatNumber(record.input) + " tonnes",
                formatNumber(record.output) + " tonnes",
                yieldPercentage.toFixed(1) + "%",
                formatDate(record.date),
                escapeHTML(record.status)
            ];
        }
    },


    sales: {
        form: "sales-form",
        body: "sales-records",
        name: "Sales",

        fields: {
            customer: "sales-customer",
            product: "sales-product",
            quantity: "sales-quantity",
            price: "sales-price",
            date: "sales-date",
            status: "sales-status"
        },

        columns: record => [
            escapeHTML(record.customer),
            escapeHTML(record.product),
            formatNumber(record.quantity) + " tonnes",
            formatMoney(record.price),
            formatMoney(record.total),
            formatDate(record.date),
            escapeHTML(record.status)
        ]
    },


    logistics: {
        form: "logistics-form",
        body: "logistics-records",
        name: "Logistics",

        fields: {
            reference: "logistics-reference",
            recipient: "logistics-recipient",
            product: "logistics-product",
            quantity: "logistics-quantity",
            destination: "logistics-destination",
            transport: "logistics-transport",
            date: "logistics-date",
            status: "logistics-status"
        },

        columns: record => [
            escapeHTML(record.reference),
            escapeHTML(record.recipient),
            escapeHTML(record.product),
            formatNumber(record.quantity) + " tonnes",
            escapeHTML(record.destination),
            escapeHTML(record.transport),
            escapeHTML(record.status)
        ]
    },


    finance: {
        form: "finance-form",
        body: "finance-records",
        name: "Finance",

        fields: {
            description: "finance-description",
            category: "finance-category",
            amount: "finance-amount",
            date: "finance-date"
        },

        columns: record => [
            escapeHTML(record.description),
            escapeHTML(record.category),
            formatMoney(record.amount),
            formatDate(record.date)
        ]
    }

};


/* =====================================================
   6. FORM DATA COLLECTION
===================================================== */

function collectFormData(collection) {
    const config = MODULES[collection];

    const record = {};

    Object.entries(config.fields).forEach(([key, fieldId]) => {
        const element = document.getElementById(fieldId);

        if (!element) return;

        if (
            element.type === "number"
        ) {
            record[key] = Number(element.value) || 0;
        } else {
            record[key] = element.value.trim();
        }
    });

    return record;
}


function getEditingId(form) {
    let input = form.querySelector('input[name="record-id"]');

    if (!input) {
        input = document.createElement("input");

        input.type = "hidden";
        input.name = "record-id";

        form.appendChild(input);
    }

    return input.value;
}


function setEditingId(form, id) {
    let input = form.querySelector('input[name="record-id"]');

    if (!input) {
        input = document.createElement("input");

        input.type = "hidden";
        input.name = "record-id";

        form.appendChild(input);
    }

    input.value = id;
}


/* =====================================================
   7. RECORD PREPARATION
===================================================== */

function prepareRecord(collection, record) {

    if (collection === "procurement") {

        const supplier = findRecord("suppliers", record.supplier);

        record.supplierName = supplier
            ? supplier.name
            : "Unknown Supplier";

        record.total = record.quantity * record.price;
    }


    if (collection === "receiving") {

        const supplier = findRecord("suppliers", record.supplier);

        record.supplierName = supplier
            ? supplier.name
            : "Unknown Supplier";

        record.accepted = Math.max(
            0,
            record.gross - record.rejected
        );
    }


    if (collection === "sales") {

        record.total = record.quantity * record.price;
    }


    return record;
}


/* =====================================================
   8. FORM VALIDATION
===================================================== */

function validateRecord(collection, record) {

    const config = MODULES[collection];

    for (const [key, fieldId] of Object.entries(config.fields)) {

        const element = document.getElementById(fieldId);

        if (
            element &&
            element.required &&
            !element.value.trim()
        ) {
            showToast("Please complete all required fields.");
            element.focus();

            return false;
        }
    }


    const numericFields = [
        "quantity",
        "price",
        "gross",
        "rejected",
        "input",
        "output",
        "amount",
        "capacity",
        "minimum"
    ];

    for (const key of numericFields) {

        if (
            key in record &&
            (
                !Number.isFinite(Number(record[key])) ||
                Number(record[key]) < 0
            )
        ) {
            showToast("Please enter valid positive numbers.");
            return false;
        }
    }


    if (
        collection === "receiving" &&
        record.rejected > record.gross
    ) {
        showToast("Rejected weight cannot exceed gross weight.");
        return false;
    }


    if (
        collection === "production" &&
        record.output > record.input
    ) {
        const confirmed = window.confirm(
            "Production output exceeds input quantity. Continue?"
        );

        if (!confirmed) return false;
    }


    if (
        collection === "procurement" &&
        !findRecord("suppliers", record.supplier)
    ) {
        showToast("Please select a registered supplier.");
        return false;
    }


    if (
        collection === "receiving" &&
        !findRecord("suppliers", record.supplier)
    ) {
        showToast("Please select a registered supplier.");
        return false;
    }


    return true;
}


/* =====================================================
   9. SAVE AND UPDATE RECORDS
===================================================== */

function handleFormSubmit(collection, event) {

    event.preventDefault();

    const form = event.currentTarget;

    const record = collectFormData(collection);

    if (!validateRecord(collection, record)) {
        return;
    }

    prepareRecord(collection, record);

    const editingId = getEditingId(form);

    if (editingId) {

        const index = database[collection].findIndex(
            item => item.id === editingId
        );

        if (index === -1) {
            showToast("Record could not be found.");
            return;
        }

        record.id = editingId;

        record.createdAt =
            database[collection][index].createdAt ||
            new Date().toISOString();

        record.updatedAt = new Date().toISOString();

        database[collection][index] = record;

        logActivity(
            "Updated " + collection + " record",
            MODULES[collection].name
        );

        if (!commitDatabase("Record updated successfully.")) {
            return;
        }

    } else {

        record.id = generateId();

        record.createdAt = new Date().toISOString();

        database[collection].unshift(record);

        logActivity(
            "Added new " + collection + " record",
            MODULES[collection].name
        );

        if (!commitDatabase("Record saved successfully.")) {
            return;
        }
    }

    form.reset();
    setEditingId(form, "");
    updateSupplierDropdowns();
    renderAll();
}


/* =====================================================
   10. TABLE RENDERING
===================================================== */

function renderTable(collection) {

    const config = MODULES[collection];

    const body = document.getElementById(config.body);

    if (!body) return;

    const records = database[collection];

    if (!records.length) {

        const columnCount = config.columns(records[0] || {}).length + 1;

        body.innerHTML = `
            <tr>
                <td colspan="${columnCount}" class="empty-row">
                    No records available.
                </td>
            </tr>
        `;

        return;
    }


    body.innerHTML = records.map(record => {

        const cells = config.columns(record);

        return `
            <tr>
                ${cells.map(cell => `<td>${cell}</td>`).join("")}

                <td>
                    <button
                        type="button"
                        class="edit-btn"
                        data-action="edit"
                        data-collection="${collection}"
                        data-id="${escapeHTML(record.id)}">
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                        data-action="delete"
                        data-collection="${collection}"
                        data-id="${escapeHTML(record.id)}">
                        Delete
                    </button>
                </td>
            </tr>
        `;

    }).join("");
}


/* =====================================================
   11. EDIT RECORDS
===================================================== */

function editRecord(collection, id) {

    const record = findRecord(collection, id);

    if (!record) {
        showToast("Record not found.");
        return;
    }

    const config = MODULES[collection];

    const form = document.getElementById(config.form);

    if (!form) return;

    Object.entries(config.fields).forEach(([key, fieldId]) => {

        const element = document.getElementById(fieldId);

        if (!element) return;

        element.value = record[key] ?? "";
    });

    setEditingId(form, id);

    form.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    showToast("Editing selected record.");
}


/* =====================================================
   12. DELETE RECORDS
===================================================== */

function deleteRecord(collection, id) {

    const record = findRecord(collection, id);

    if (!record) return;

    const confirmed = window.confirm(
        "Are you sure you want to delete this record?"
    );

    if (!confirmed) return;

    database[collection] = database[collection].filter(
        item => item.id !== id
    );

    logActivity(
        "Deleted " + collection + " record",
        MODULES[collection].name
    );

    if (!commitDatabase("Record deleted.")) {
        return;
    }

    updateSupplierDropdowns();
}


/* =====================================================
   13. TABLE ACTION LISTENERS
===================================================== */

function initializeTableActions() {

    document.addEventListener("click", event => {

        const button = event.target.closest("[data-action]");

        if (!button) return;

        const action = button.dataset.action;
        const collection = button.dataset.collection;
        const id = button.dataset.id;

        if (!MODULES[collection]) return;

        if (action === "edit") {
            editRecord(collection, id);
        }

        if (action === "delete") {
            deleteRecord(collection, id);
        }

    });

}


/* =====================================================
   14. SUPPLIER DROPDOWNS
===================================================== */

function updateSupplierDropdowns() {

    const dropdownIds = [
        "procurement-supplier",
        "receiving-supplier"
    ];

    dropdownIds.forEach(id => {

        const select = document.getElementById(id);

        if (!select) return;

        const selectedValue = select.value;

        select.innerHTML = `
            <option value="">Select supplier</option>
        `;

        database.suppliers.forEach(supplier => {

            const option = document.createElement("option");

            option.value = supplier.id;
            option.textContent = supplier.name;

            select.appendChild(option);
        });

        if (
            database.suppliers.some(
                supplier => supplier.id === selectedValue
            )
        ) {
            select.value = selectedValue;
        }

    });

}


/* =====================================================
   15. DASHBOARD STATISTICS
===================================================== */

function renderDashboard() {

    const suppliers = database.suppliers.length;
    const buyers = database.buyers.length;
    const inventory = database.inventory.length;
    const orders = database.sales.length;

    const salesValue = totalOf("sales", "total");
    const expenses = totalOf("finance", "amount");

    const balance = salesValue - expenses;


    setText("dashboard-suppliers", suppliers);
    setText("dashboard-buyers", buyers);
    setText("dashboard-inventory", inventory);
    setText("dashboard-orders", orders);

    setText("dashboard-sales-value", formatMoney(salesValue));
    setText("dashboard-expenses", formatMoney(expenses));

    setText("dashboard-sales-snapshot", formatMoney(salesValue));
    setText("dashboard-expenses-snapshot", formatMoney(expenses));
    setText("dashboard-balance", formatMoney(balance));


    setText(
        "overview-procurement",
        database.procurement.length
    );

    setText(
        "overview-receiving",
        database.receiving.length
    );

    setText(
        "overview-production",
        database.production.length
    );

    setText(
        "overview-logistics",
        database.logistics.length
    );


    const activityBody = document.getElementById("recent-activity");

    if (activityBody) {

        if (!database.activity.length) {

            activityBody.innerHTML = `
                <tr>
                    <td colspan="3" class="empty-row">
                        No activities recorded yet.
                    </td>
                </tr>
            `;

        } else {

            activityBody.innerHTML = database.activity
                .slice(0, 8)
                .map(activity => `
                    <tr>
                        <td>${escapeHTML(activity.action)}</td>
                        <td>${escapeHTML(activity.module)}</td>
                        <td>${formatDateTime(activity.date)}</td>
                    </tr>
                `)
                .join("");

        }
    }


    setText(
        "current-date",
        new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        })
    );

}


/* =====================================================
   16. MARKET INTELLIGENCE STATISTICS
===================================================== */

function renderMarketStats() {

    const buyers = database.buyers;

    const uniqueProducts = new Set(
        buyers.map(buyer => buyer.product)
    );

    const totalDemand = buyers.reduce(
        (total, buyer) => total + (Number(buyer.quantity) || 0),
        0
    );

    setText("market-buyer-count", buyers.length);

    setText(
        "market-demand-count",
        formatNumber(totalDemand) + " tonnes"
    );

    setText(
        "market-product-count",
        uniqueProducts.size
    );

}


/* =====================================================
   17. INVENTORY STATISTICS
===================================================== */

function renderInventoryStats() {

    const inventory = database.inventory;

    const total = inventory.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
    );

    const lowStock = inventory.filter(
        item => Number(item.quantity) <= Number(item.minimum)
    ).length;

    setText("inventory-count", inventory.length);

    setText("inventory-total", formatNumber(total));

    setText("inventory-low", lowStock);

}


/* =====================================================
   18. FINANCE STATISTICS
===================================================== */

function renderFinanceStats() {

    const sales = totalOf("sales", "total");

    const expenses = totalOf("finance", "amount");

    const balance = sales - expenses;

    setText("finance-sales", formatMoney(sales));

    setText("finance-expenses", formatMoney(expenses));

    setText("finance-balance", formatMoney(balance));

}


/* =====================================================
   19. REPORTS & ANALYTICS
===================================================== */

function renderReports() {

    const procurement = totalOf("procurement", "total");

    const sales = totalOf("sales", "total");

    const expenses = totalOf("finance", "amount");

    const inventory = database.inventory.length;


    setText("report-procurement", formatMoney(procurement));

    setText("report-sales", formatMoney(sales));

    setText("report-expenses", formatMoney(expenses));

    setText("report-inventory", inventory);


    setText(
        "report-inventory-count",
        inventory
    );

    setText(
        "report-supplier-count",
        database.suppliers.length
    );

    setText(
        "report-procurement-count",
        database.procurement.length
    );

    setText(
        "report-receiving-count",
        database.receiving.length
    );

    setText(
        "report-production-count",
        database.production.length
    );

    setText(
        "report-orders-count",
        database.sales.length
    );

    setText(
        "report-logistics-count",
        database.logistics.length
    );


    setText(
        "report-financial-revenue",
        formatMoney(sales)
    );

    setText(
        "report-financial-expenses",
        formatMoney(expenses)
    );

    setText(
        "report-financial-balance",
        formatMoney(sales - expenses)
    );


    const maximum = Math.max(procurement, sales, 1);

    const procurementPercentage =
        Math.min((procurement / maximum) * 100, 100);

    const salesPercentage =
        Math.min((sales / maximum) * 100, 100);


    const procurementBar = document.getElementById(
        "report-procurement-bar"
    );

    const salesBar = document.getElementById(
        "report-sales-bar"
    );


    if (procurementBar) {
        procurementBar.style.width = procurementPercentage + "%";
    }

    if (salesBar) {
        salesBar.style.width = salesPercentage + "%";
    }


    setText(
        "report-procurement-status",
        procurement > 0
            ? "Procurement activity recorded"
            : "Awaiting procurement records"
    );

    setText(
        "report-sales-status",
        sales > 0
            ? "Sales activity recorded"
            : "Awaiting sales records"
    );

}


/* =====================================================
   20. RENDER ALL MODULES
===================================================== */

function renderAll() {

    Object.keys(MODULES).forEach(collection => {
        renderTable(collection);
    });

    renderDashboard();

    renderMarketStats();

    renderInventoryStats();

    renderFinanceStats();

    renderReports();

    updateSupplierDropdowns();

}


/* =====================================================
   21. FORM INITIALIZATION
===================================================== */

function initializeForms() {

    Object.entries(MODULES).forEach(([collection, config]) => {

        const form = document.getElementById(config.form);

        if (!form) return;

        form.addEventListener("submit", event => {
            handleFormSubmit(collection, event);
        });

        form.addEventListener("reset", () => {

            setTimeout(() => {
                setEditingId(form, "");
            }, 0);

        });

    });

}


/* =====================================================
   22. NAVIGATION
===================================================== */

function initializeNavigation() {

    const links = document.querySelectorAll(".nav-link");

    const sections = document.querySelectorAll(".content-section");

    const sidebar = document.getElementById("sidebar");

    const menuToggle = document.getElementById("menu-toggle");


    function openSection(sectionId, updateHash = true) {

        const target = document.getElementById(sectionId);

        if (!target || !target.classList.contains("content-section")) {
            sectionId = "dashboard";
        }

        sections.forEach(section => {
            section.classList.toggle(
                "active",
                section.id === sectionId
            );
        });

        links.forEach(link => {
            const active = link.dataset.section === sectionId;

            link.classList.toggle("active", active);

            if (active) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        if (updateHash) {
            history.replaceState(null, "", "#" + sectionId);
        }

        if (sidebar) {
            sidebar.classList.remove("open");
        }

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    links.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            openSection(link.dataset.section);

        });

    });


    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", () => {

            const isOpen = sidebar.classList.toggle("open");

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        });

    }


    document.addEventListener("click", event => {

        if (
            window.innerWidth <= 760 &&
            sidebar &&
            menuToggle &&
            sidebar.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            sidebar.classList.remove("open");

            menuToggle.setAttribute("aria-expanded", "false");
        }

    });


    window.addEventListener("hashchange", () => {

        const sectionId = window.location.hash.replace("#", "");

        openSection(sectionId || "dashboard", false);

    });


    const initialSection = window.location.hash.replace("#", "");

    openSection(initialSection || "dashboard", false);

}


/* =====================================================
   23. TABLE SEARCH
===================================================== */

function initializeSearch() {

    document.querySelectorAll("[data-search]").forEach(input => {

        input.addEventListener("input", () => {

            const tableId = input.dataset.search;

            const table = document.getElementById(tableId);

            if (!table) return;

            const rows = table.querySelectorAll("tbody tr");

            const query = input.value.toLowerCase().trim();

            rows.forEach(row => {

                const matches = row.textContent
                    .toLowerCase()
                    .includes(query);

                row.style.display = matches ? "" : "none";

            });

        });

    });

}


/* =====================================================
   24. CSV EXPORT
===================================================== */

function csvSafe(value) {

    let text = String(value ?? "");

    if (/^[\s]*[=+\-@]/.test(text)) {
        text = "'" + text;
    }

    return '"' + text.replace(/"/g, '""') + '"';
}


function downloadFile(content, filename, type) {

    const blob = new Blob(
        [content],
        { type }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

}


function exportData(format = "csv") {

    if (format !== "csv") {
        showToast("Unsupported export format.");
        return;
    }

    const rows = [
        ["MODULE", "RECORD ID", "RECORD DATA"]
    ];

    Object.entries(MODULES).forEach(([collection]) => {

        database[collection].forEach(record => {

            rows.push([
                collection,
                record.id,
                JSON.stringify(record)
            ]);

        });

    });


    const csv = rows
        .map(row => row.map(csvSafe).join(","))
        .join("\n");


    downloadFile(
        "\uFEFF" + csv,
        "Hub01-Data-Export-" + today() + ".csv",
        "text/csv;charset=utf-8;"
    );

    showToast("CSV export prepared.");
}


/* =====================================================
   25. JSON BACKUP
===================================================== */

function backupDatabase() {

    const backup = {
        application: "Hub 01 One System",
        organisation: "EV Empire Ventures",
        version: "2.0",
        exportedAt: new Date().toISOString(),
        database
    };

    downloadFile(
        JSON.stringify(backup, null, 2),
        "Hub01-Backup-" + today() + ".json",
        "application/json"
    );

    showToast("Backup downloaded successfully.");
}


/* =====================================================
   26. JSON RESTORE
===================================================== */

function restoreDatabase(file) {

    if (!file) return;

    const reader = new FileReader();

    reader.onload = event => {

        try {

            const imported = JSON.parse(event.target.result);

            const importedDatabase = imported.database || imported;

            if (
                !importedDatabase ||
                typeof importedDatabase !== "object" ||
                Array.isArray(importedDatabase)
            ) {
                throw new Error("Invalid backup structure.");
            }

            const newDatabase = structuredDatabaseCopy();

            COLLECTIONS.forEach(collection => {

                if (
                    Array.isArray(importedDatabase[collection])
                ) {
                    newDatabase[collection] = importedDatabase[collection];
                }

            });


            const confirmed = window.confirm(
                "Restoring this backup will replace the current browser records. Continue?"
            );

            if (!confirmed) return;


            const previousDatabase = database;

            database = newDatabase;

            if (!saveDatabase()) {

                database = previousDatabase;

                showToast("Restore failed. Existing records were preserved.");

                return;
            }

            renderAll();

            showToast("Backup restored successfully.");

        } catch (error) {

            console.error("Restore error:", error);

            showToast("Invalid or unsupported backup file.");

        }

    };

    reader.readAsText(file);

}


/* =====================================================
   27. BACKUP AND RESTORE LISTENERS
===================================================== */

function initializeBackupSystem() {

    const backupButton = document.getElementById("backup-data");

    const restoreButton = document.getElementById("restore-data");

    const restoreInput = document.getElementById("restore-file");


    if (backupButton) {

        backupButton.addEventListener("click", backupDatabase);

    }


    if (restoreButton && restoreInput) {

        restoreButton.addEventListener("click", () => {
            restoreInput.click();
        });

    }


    if (restoreInput) {

        restoreInput.addEventListener("change", event => {

            const file = event.target.files[0];

            if (file) {
                restoreDatabase(file);
            }

            event.target.value = "";

        });

    }

}


/* =====================================================
   28. APPLICATION INITIALIZATION
===================================================== */

function initializeHub01() {

    console.log(
        "HUB 01 ONE SYSTEM™ — VERSION 2.0 INITIALIZING"
    );

    initializeForms();

    initializeTableActions();

    initializeNavigation();

    initializeSearch();

    initializeBackupSystem();

    renderAll();

    console.log(
        "HUB 01 ONE SYSTEM™ — READY"
    );

}


/* =====================================================
   29. START APPLICATION
===================================================== */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeHub01
    );

} else {

    initializeHub01();

}


/* =====================================================
   30. GLOBAL EXPORT FUNCTION
===================================================== */

window.exportData = exportData;
