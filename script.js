/* =====================================================
   HUB 01 ONE SYSTEM™
   EV EMPIRE VENTURES
   Version 1.0 - Browser Prototype
===================================================== */
"use strict";
/* =====================================================
   1. DATABASE
===================================================== */
const DB_KEY = "hub01_database_v1";
const emptyDatabase = {
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
function loadDatabase() {
    try {
        const saved = localStorage.getItem(DB_KEY);
        if (!saved) {
            return structuredClone(emptyDatabase);
        }
        const parsed = JSON.parse(saved);
        return {
            ...structuredClone(emptyDatabase),
            ...parsed
        };
    } catch (error) {
        console.error("Database loading error:", error);
        return structuredClone(emptyDatabase);
    }
}
let db = loadDatabase();
function saveDatabase() {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        return true;
    } catch (error) {
        console.error("Database saving error:", error);
        showToast("Unable to save. Browser storage may be full.");
        return false;
    }
}
/* =====================================================
   2. GENERAL UTILITIES
===================================================== */
function createId() {
    return Date.now().toString(36) +
        Math.random().toString(36).slice(2, 8);
}
function getValue(id) {
    return document.getElementById(id)?.value.trim() || "";
}
function getNumber(id) {
    return Number(getValue(id)) || 0;
}
function money(value) {
    return "GH₵" + Number(value || 0).toLocaleString(
        "en-GH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}
function numberFormat(value) {
    return Number(value || 0).toLocaleString("en-GH", {
        maximumFractionDigits: 2
    });
}
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };
        return characters[character];
    });
}
function today() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}
function findRecord(collection, id) {
    return db[collection].find(record => record.id === id);
}
function addActivity(message, module) {
    db.activity.unshift({
        id: createId(),
        message,
        module,
        date: new Date().toISOString()
    });
    db.activity = db.activity.slice(0, 50);
}
function commitRecord(message, module) {
    addActivity(message, module);
    if (saveDatabase()) {
        renderAll();
        showToast(message);
    }
}
function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        const hidden = form.querySelector('input[type="hidden"]');
        if (hidden) {
            hidden.value = "";
        }
    }
}
/* =====================================================
   3. NAVIGATION
===================================================== */
const navigationLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".content-section");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menu-toggle");
function showSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target || !target.classList.contains("content-section")) {
        sectionId = "dashboard";
    }
    sections.forEach(section => {
        section.classList.toggle("active", section.id === sectionId);
    });
    navigationLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.section === sectionId
        );
    });
    if (sidebar) {
        sidebar.classList.remove("open");
    }
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
navigationLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        const sectionId = link.dataset.section;
        showSection(sectionId);
        history.replaceState(null, "", `#${sectionId}`);
    });
});
if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        sidebar?.classList.toggle("open");
    });
}
window.addEventListener("hashchange", () => {
    showSection(location.hash.slice(1) || "dashboard");
});
/* =====================================================
   4. FORM CONFIGURATIONS
===================================================== */
const formConfigurations = {
    buyers: {
        form: "buyer-form",
        table: "buyer-records",
        module: "Market Intelligence",
        message: "Buyer",
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
        columns: [
            record => record.name,
            record => record.location,
            record => record.product,
            record => numberFormat(record.quantity) + " tonnes",
            record => money(record.price)
        ]
    },
    suppliers: {
        form: "supplier-form",
        table: "supplier-records",
        module: "Suppliers",
        message: "Supplier",
        fields: {
            name: "supplier-name",
            contact: "supplier-contact",
            location: "supplier-location",
            category: "supplier-category",
            product: "supplier-product",
            capacity: "supplier-capacity"
        },
        columns: [
            record => record.name,
            record => record.contact,
            record => record.location,
            record => record.category,
            record => record.product
        ]
    },
    procurement: {
        form: "procurement-form",
        table: "procurement-records",
        module: "Procurement",
        message: "Procurement",
        fields: {
            supplierId: "procurement-supplier",
            product: "procurement-product",
            quantity: "procurement-quantity",
            price: "procurement-price",
            date: "procurement-date",
            reference: "procurement-reference"
        },
        columns: [
            record => record.reference,
            record => record.supplierName,
            record => record.product,
            record => numberFormat(record.quantity) + " tonnes",
            record => money(record.total),
            record => record.date
        ]
    },
    receiving: {
        form: "receiving-form",
        table: "receiving-records",
        module: "Receiving",
        message: "Receiving record",
        fields: {
            supplierId: "receiving-supplier",
            product: "receiving-product",
            gross: "receiving-gross",
            rejected: "receiving-rejected",
            grade: "receiving-grade",
            date: "receiving-date"
        },
        columns: [
            record => record.supplierName,
            record => record.product,
            record => numberFormat(record.gross) + " tonnes",
            record => numberFormat(record.rejected) + " tonnes",
            record => numberFormat(record.accepted) + " tonnes",
            record => record.grade,
            record => record.date
        ]
    },
    inventory: {
        form: "inventory-form",
        table: "inventory-records",
        module: "Inventory",
        message: "Inventory record",
        fields: {
            product: "inventory-product",
            quantity: "inventory-quantity",
            location: "inventory-location",
            batch: "inventory-batch",
            minimum: "inventory-minimum"
        },
        columns: [
            record => record.product,
            record => numberFormat(record.quantity) + " tonnes",
            record => record.location,
            record => record.batch,
            record => record.quantity <= record.minimum
                ? "Low Stock"
                : "Available"
        ]
    },
    production: {
        form: "production-form",
        table: "production-records",
        module: "Production",
        message: "Production batch",
        fields: {
            batch: "production-batch",
            product: "production-product",
            input: "production-input",
            output: "production-output",
            date: "production-date",
            status: "production-status"
        },
        columns: [
            record => record.batch,
            record => record.product,
            record => numberFormat(record.input),
            record => numberFormat(record.output),
            record => record.input > 0
                ? numberFormat(record.output / record.input * 100) + "%"
                : "0%",
            record => record.date,
            record => record.status
        ]
    },
    sales: {
        form: "sales-form",
        table: "sales-records",
        module: "Sales",
        message: "Sales order",
        fields: {
            customer: "sales-customer",
            product: "sales-product",
            quantity: "sales-quantity",
            price: "sales-price",
            date: "sales-date",
            status: "sales-status"
        },
        columns: [
            record => record.customer,
            record => record.product,
            record => numberFormat(record.quantity) + " tonnes",
            record => money(record.price),
            record => money(record.total),
            record => record.date,
            record => record.status
        ]
    },
    logistics: {
        form: "logistics-form",
        table: "logistics-records",
        module: "Logistics",
        message: "Shipment",
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
        columns: [
            record => record.reference,
            record => record.recipient,
            record => record.product,
            record => numberFormat(record.quantity) + " tonnes",
            record => record.destination,
            record => record.transport,
            record => record.status
        ]
    },
    finance: {
        form: "finance-form",
        table: "finance-records",
        module: "Finance",
        message: "Expense",
        fields: {
            description: "finance-description",
            category: "finance-category",
            amount: "finance-amount",
            date: "finance-date"
        },
        columns: [
            record => record.description,
            record => record.category,
            record => money(record.amount),
            record => record.date
        ]
    }
};
/* =====================================================
   5. FORM SUBMISSION
===================================================== */
function collectFormData(configuration) {
    const data = {};
    Object.entries(configuration.fields).forEach(([key, inputId]) => {
        const input = document.getElementById(inputId);
        if (!input) return;
        data[key] = input.type === "number"
            ? Number(input.value) || 0
            : input.value.trim();
    });
    return data;
}
function prepareRecord(collection, data) {
    if (collection === "procurement" || collection === "receiving") {
        const supplier = findRecord("suppliers", data.supplierId);
        if (!supplier) {
            throw new Error("Please register or select a valid supplier.");
        }
        data.supplierName = supplier.name;
    }
    if (collection === "procurement") {
        data.total = data.quantity * data.price;
        if (!data.reference) {
            data.reference = "PUR-" + Date.now();
        }
    }
    if (collection === "receiving") {
        data.accepted = data.gross - data.rejected;
        if (data.rejected > data.gross) {
            throw new Error("Rejected weight cannot exceed gross weight.");
        }
    }
    if (collection === "sales") {
        data.total = data.quantity * data.price;
    }
    return data;
}
Object.entries(formConfigurations).forEach(([collection, configuration]) => {
    const form = document.getElementById(configuration.form);
    if (!form) return;
    form.addEventListener("submit", event => {
        event.preventDefault();
        const hiddenId = form.querySelector('input[type="hidden"]');
        const editingId = hiddenId?.value || "";
        try {
            let data = collectFormData(configuration);
            data = prepareRecord(collection, data);
            if (editingId) {
                const index = db[collection].findIndex(
                    record => record.id === editingId
                );
                if (index === -1) {
                    throw new Error("Record could not be found.");
                }
                db[collection][index] = {
                    ...db[collection][index],
                    ...data,
                    updatedAt: new Date().toISOString()
                };
                commitRecord(
                    configuration.message + " updated successfully.",
                    configuration.module
                );
            } else {
                const record = {
                    id: createId(),
                    ...data,
                    createdAt: new Date().toISOString()
                };
                db[collection].unshift(record);
                commitRecord(
                    configuration.message + " saved successfully.",
                    configuration.module
                );
            }
            resetForm(configuration.form);
        } catch (error) {
            showToast(error.message || "Unable to save record.");
        }
    });
});
/* =====================================================
   6. SUPPLIER DROPDOWNS
===================================================== */
function renderSupplierOptions() {
    const supplierFields = [
        "procurement-supplier",
        "receiving-supplier"
    ];
    supplierFields.forEach(fieldId => {
        const select = document.getElementById(fieldId);
        if (!select) return;
        const previousValue = select.value;
        select.innerHTML = '<option value="">Select supplier</option>';
        db.suppliers.forEach(supplier => {
            const option = document.createElement("option");
            option.value = supplier.id;
            option.textContent = supplier.name;
            select.appendChild(option);
        });
        if (db.suppliers.some(item => item.id === previousValue)) {
            select.value = previousValue;
        }
    });
}
/* =====================================================
   7. TABLE RENDERING
===================================================== */
function renderTable(collection) {
    const configuration = formConfigurations[collection];
    if (!configuration) return;
    const tbody = document.getElementById(configuration.table);
    if (!tbody) return;
    const records = db[collection];
    if (!records.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="12" class="empty-row">
                    No records available yet.
                </td>
            </tr>
        `;
        return;
    }
    tbody.innerHTML = records.map(record => {
        const cells = configuration.columns.map(column => {
            return `<td>${escapeHTML(column(record))}</td>`;
        }).join("");
        return `
            <tr>
                ${cells}
                <td>
                    <button
                        class="secondary-button"
                        data-action="edit"
                        data-collection="${collection}"
                        data-id="${escapeHTML(record.id)}">
                        Edit
                    </button>
                    <button
                        class="danger-button"
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
   8. EDIT RECORDS
===================================================== */
function editRecord(collection, id) {
    const configuration = formConfigurations[collection];
    const record = findRecord(collection, id);
    if (!configuration || !record) return;
    const form = document.getElementById(configuration.form);
    if (!form) return;
    Object.entries(configuration.fields).forEach(([key, inputId]) => {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = record[key] ?? "";
        }
    });
    const hiddenId = form.querySelector('input[type="hidden"]');
    if (hiddenId) {
        hiddenId.value = record.id;
    }
    showSection(
        collection === "buyers" ? "market-intelligence" :
        collection === "suppliers" ? "suppliers" :
        collection
    );
    form.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
    showToast("Editing selected record.");
}
/* =====================================================
   9. DELETE RECORDS
===================================================== */
function deleteRecord(collection, id) {
    if (!formConfigurations[collection]) return;
    const record = findRecord(collection, id);
    if (!record) return;
    const confirmed = confirm(
        "Are you sure you want to delete this record?"
    );
    if (!confirmed) return;
    db[collection] = db[collection].filter(
        item => item.id !== id
    );
    commitRecord("Record deleted successfully.", "Data Management");
}
/* =====================================================
   10. TABLE ACTIONS
===================================================== */
document.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const collection = button.dataset.collection;
    const id = button.dataset.id;
    if (action === "edit") {
        editRecord(collection, id);
    }
    if (action === "delete") {
        deleteRecord(collection, id);
    }
});
/* =====================================================
   11. DASHBOARD STATISTICS
===================================================== */
function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}
function sum(collection, field) {
    return db[collection].reduce(
        (total, record) => total + Number(record[field] || 0),
        0
    );
}
function renderDashboard() {
    setText("dashboard-suppliers", db.suppliers.length);
    setText("dashboard-buyers", db.buyers.length);
    setText("dashboard-inventory", db.inventory.length);
    setText("dashboard-orders", db.sales.length);
    setText("overview-procurement", db.procurement.length);
    setText("overview-receiving", db.receiving.length);
    setText("overview-production", db.production.length);
    setText("overview-logistics", db.logistics.length);
    const salesTotal = sum("sales", "total");
    const expenseTotal = sum("finance", "amount");
    setText("dashboard-sales-value", money(salesTotal));
    setText("dashboard-expenses", money(expenseTotal));
    const activity = document.getElementById("recent-activity");
    if (activity) {
        activity.innerHTML = db.activity.length
            ? db.activity.slice(0, 8).map(item => `
                <tr>
                    <td>${escapeHTML(item.message)}</td>
                    <td>${escapeHTML(item.module)}</td>
                    <td>${escapeHTML(
                        new Date(item.date).toLocaleString()
                    )}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="3" class="empty-row">
                No activities recorded yet.
               </td></tr>`;
    }
    setText("current-date", new Date().toLocaleDateString(
        "en-GH",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    ));
}
/* =====================================================
   12. MARKET INTELLIGENCE STATISTICS
===================================================== */
function renderMarketStatistics() {
    setText("market-buyer-count", db.buyers.length);
    setText("market-demand-count", db.buyers.length);
    const products = new Set(
        db.buyers.map(record => record.product)
    );
    setText("market-product-count", products.size);
}
/* =====================================================
   13. INVENTORY STATISTICS
===================================================== */
function renderInventoryStatistics() {
    const total = sum("inventory", "quantity");
    const lowStock = db.inventory.filter(
        record => record.quantity <= record.minimum
    ).length;
    setText("inventory-count", db.inventory.length);
    setText("inventory-total", numberFormat(total));
    setText("inventory-low", lowStock);
}
/* =====================================================
   14. FINANCE STATISTICS
===================================================== */
function renderFinanceStatistics() {
    const sales = sum("sales", "total");
    const expenses = sum("finance", "amount");
    setText("finance-sales", money(sales));
    setText("finance-expenses", money(expenses));
    setText("finance-balance", money(sales - expenses));
}
/* =====================================================
   15. REPORT STATISTICS
===================================================== */
function renderReportStatistics() {
    setText("report-suppliers", db.suppliers.length);
    setText("report-buyers", db.buyers.length);
    setText("report-orders", db.sales.length);
}
/* =====================================================
   16. SEARCH
===================================================== */
document.querySelectorAll("[data-search]").forEach(input => {
    input.addEventListener("input", () => {
        const tableId = input.dataset.search;
        const table = document.getElementById(tableId);
        if (!table) return;
        const query = input.value.toLowerCase();
        table.querySelectorAll("tbody tr").forEach(row => {
            row.style.display = row.textContent
                .toLowerCase()
                .includes(query) ? "" : "none";
        });
    });
});
/* =====================================================
   17. CSV EXPORT
===================================================== */
function exportCSV(collection) {
    if (!formConfigurations[collection]) return;
    const records = db[collection];
    if (!records.length) {
        showToast("There are no records to export.");
        return;
    }
    const keys = Object.keys(records[0]).filter(
        key => key !== "id"
    );
    const rows = [
        keys,
        ...records.map(record =>
            keys.map(key => record[key] ?? "")
        )
    ];
    const csv = rows.map(row =>
        row.map(value =>
            `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
    ).join("\r\n");
    const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hub01-${collection}-${today()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("CSV export prepared.");
}
document.querySelectorAll("[data-export]").forEach(button => {
    button.addEventListener("click", () => {
        exportCSV(button.dataset.export);
    });
});
/* =====================================================
   18. BACKUP
===================================================== */
const backupButton = document.getElementById("backup-data");
if (backupButton) {
    backupButton.addEventListener("click", () => {
        const backup = {
            application: "Hub 01 One System",
            version: "1.0",
            exportedAt: new Date().toISOString(),
            database: db
        };
        const blob = new Blob(
            [JSON.stringify(backup, null, 2)],
            { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `hub01-backup-${today()}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showToast("Data backup downloaded.");
    });
}
/* =====================================================
   19. RESTORE BACKUP
===================================================== */
const restoreButton = document.getElementById("restore-data");
const restoreFile = document.getElementById("restore-file");
if (restoreButton && restoreFile) {
    restoreButton.addEventListener("click", () => {
        restoreFile.click();
    });
    restoreFile.addEventListener("change", async () => {
        const file = restoreFile.files[0];
        if (!file) return;
        try {
            const text = await file.text();
            const backup = JSON.parse(text);
            const restored = backup.database || backup;
            const validCollections = Object.keys(emptyDatabase);
            const isValid = restored &&
                validCollections.every(key =>
                    Array.isArray(restored[key])
                );
            if (!isValid) {
                throw new Error("Invalid Hub 01 backup file.");
            }
            const confirmed = confirm(
                "Restoring this backup will replace the records currently stored in this browser. Continue?"
            );
            if (!confirmed) {
                restoreFile.value = "";
                return;
            }
            db = {
                ...structuredClone(emptyDatabase),
                ...restored
            };
            if (saveDatabase()) {
                renderAll();
                showToast("Backup restored successfully.");
            }
        } catch (error) {
            showToast(error.message || "Backup restoration failed.");
        }
        restoreFile.value = "";
    });
}
/* =====================================================
   20. RENDER ALL MODULES
===================================================== */
function renderAll() {
    renderSupplierOptions();
    Object.keys(formConfigurations).forEach(collection => {
        renderTable(collection);
    });
    renderDashboard();
    renderMarketStatistics();
    renderInventoryStatistics();
    renderFinanceStatistics();
    renderReportStatistics();
}
/* =====================================================
   21. INITIALIZE APPLICATION
===================================================== */
function initializeHub01() {
    renderAll();
    const initialSection = location.hash.slice(1);
    showSection(
        document.getElementById(initialSection)?.classList.contains("content-section")
            ? initialSection
            : "dashboard"
    );
    console.log(
        "Hub 01 One System™ initialized successfully."
    );
}
document.addEventListener("DOMContentLoaded", initializeHub01);
