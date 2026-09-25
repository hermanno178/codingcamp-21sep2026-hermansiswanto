let totalBudget =
    Number(localStorage.getItem("totalBudget")) || 0;

let spendingLimit =
    Number(localStorage.getItem("spendingLimit")) || 0;

let expenses =
    JSON.parse(localStorage.getItem("expenses")) || [];

let darkMode =
    localStorage.getItem("darkMode") === "true";


// =========================
// BUAT ID UNTUK DATA LAMA
// =========================

expenses = expenses.map(function (expense) {

    return {
        ...expense,
        id: expense.id || generateId()
    };

});

localStorage.setItem(
    "expenses",
    JSON.stringify(expenses)
);


// =========================
// TOTAL PENGELUARAN
// =========================

let totalExpense = expenses.reduce(function (total, expense) {

    return total + Number(expense.amount);

}, 0);


// =========================
// ELEMENT
// =========================

const expenseForm =
    document.getElementById("expenseForm");

const budgetForm =
    document.getElementById("budgetForm");

const transactionList =
    document.getElementById("transactionList");

const sortSelect =
    document.getElementById("sortSelect");

const themeToggle =
    document.getElementById("themeToggle");


// =========================
// DARK MODE
// =========================

if (darkMode) {

    document.body.classList.add("dark");

    themeToggle.textContent =
        "☀️ Light Mode";
}


themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    darkMode =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "darkMode",
        darkMode
    );

    themeToggle.textContent =
        darkMode
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";
});


// =========================
// CHART
// =========================

const chartCanvas =
    document.getElementById("expenseChart");

const expenseChart = new Chart(chartCanvas, {

    type: "doughnut",

    data: {

        labels: [],

        datasets: [{

            data: [],

            backgroundColor: [
                "#6366f1",
                "#22c55e",
                "#f59e0b",
                "#ef4444",
                "#06b6d4",
                "#ec4899"
            ],

            borderWidth: 2,

            borderColor: "#ffffff"
        }]
    },

    options: {

        responsive: true,

        plugins: {

            legend: {
                position: "bottom"
            }
        }
    }
});


// =========================
// DATA AWAL
// =========================

document.getElementById("totalBudget").textContent =
    formatRupiah(totalBudget);

document.getElementById("totalExpense").textContent =
    formatRupiah(totalExpense);

document.getElementById("budget").value =
    totalBudget || "";

document.getElementById("limit").value =
    spendingLimit || "";

updateRemaining();

updateTransactionList();

updateChart();


// =========================
// SIMPAN BUDGET
// =========================

budgetForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const budget =
        Number(document.getElementById("budget").value);

    const limit =
        Number(document.getElementById("limit").value) || 0;


    if (budget <= 0) {

        alert("Budget harus lebih dari 0.");

        return;
    }


    totalBudget = budget;

    spendingLimit = limit;


    localStorage.setItem(
        "totalBudget",
        totalBudget
    );

    localStorage.setItem(
        "spendingLimit",
        spendingLimit
    );


    document.getElementById("totalBudget").textContent =
        formatRupiah(totalBudget);

    updateRemaining();

    updateTransactionList();
});


// =========================
// TAMBAH PENGELUARAN
// =========================

expenseForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const description =
        document.getElementById("description").value.trim();

    const amount =
        Number(document.getElementById("amount").value);

    const date =
        document.getElementById("date").value;

    const category =
        document.getElementById("category").value;


    if (
        description === "" ||
        amount <= 0 ||
        date === "" ||
        category === ""
    ) {

        alert("Semua data pengeluaran harus diisi.");

        return;
    }


    const newExpense = {

        id: generateId(),

        description: description,

        amount: amount,

        date: date,

        category: category
    };


    expenses.push(newExpense);


    totalExpense += amount;


    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );


    document.getElementById("totalExpense").textContent =
        formatRupiah(totalExpense);


    updateRemaining();

    updateTransactionList();

    updateChart();


    expenseForm.reset();
});


// =========================
// SORT
// =========================

sortSelect.addEventListener("change", function () {

    updateTransactionList();

});


// =========================
// SISA BUDGET
// =========================

function updateRemaining() {

    const remaining =
        totalBudget - totalExpense;


    const remainingElement =
        document.getElementById("remainingBudget");


    remainingElement.textContent =
        formatRupiah(remaining);


    if (remaining < 0) {

        remainingElement.style.color =
            "#dc2626";

    } else {

        remainingElement.style.color =
            "";
    }
}


// =========================
// DAFTAR PENGELUARAN
// =========================

function updateTransactionList() {

    transactionList.innerHTML = "";


    if (expenses.length === 0) {

        transactionList.innerHTML =
            "<p>Belum ada pengeluaran.</p>";

        return;
    }


    let sortedExpenses =
        [...expenses];


    const sortType =
        sortSelect.value;


    if (sortType === "highest") {

        sortedExpenses.sort(function (a, b) {

            return b.amount - a.amount;

        });
    }


    if (sortType === "lowest") {

        sortedExpenses.sort(function (a, b) {

            return a.amount - b.amount;

        });
    }


    if (sortType === "category") {

        sortedExpenses.sort(function (a, b) {

            return a.category.localeCompare(
                b.category
            );

        });
    }


    if (sortType === "newest") {

        sortedExpenses.sort(function (a, b) {

            return new Date(b.date) -
                new Date(a.date);

        });
    }


    sortedExpenses.forEach(function (expense) {

        const transaction =
            document.createElement("div");


        transaction.className =
            "transaction-item";


        if (
            spendingLimit > 0 &&
            expense.amount >= spendingLimit
        ) {

            transaction.classList.add("warning");

        }


        const formattedDate =
            new Date(expense.date).toLocaleDateString(
                "id-ID",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );


        transaction.innerHTML = `

            <div class="transaction-info">

                <div class="transaction-name">
                    ${expense.description}
                </div>

                <div class="transaction-category">
                    ${expense.category} • ${formattedDate}
                </div>

                <div class="transaction-amount">
                    ${formatRupiah(expense.amount)}
                </div>

            </div>

            <button
                class="delete-button"
                data-id="${expense.id}"
            >
                Hapus
            </button>

        `;


        const deleteButton =
            transaction.querySelector(".delete-button");


        deleteButton.addEventListener(
            "click",
            function () {

                deleteExpenseById(expense.id);

            }
        );


        transactionList.appendChild(transaction);
    });
}


// =========================
// HAPUS PENGELUARAN
// =========================

function deleteExpenseById(id) {

    const index =
        expenses.findIndex(function (expense) {

            return expense.id === id;

        });


    if (index === -1) {

        return;
    }


    totalExpense -=
        Number(expenses[index].amount);


    expenses.splice(index, 1);


    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );


    document.getElementById("totalExpense").textContent =
        formatRupiah(totalExpense);


    updateRemaining();

    updateTransactionList();

    updateChart();
}


// =========================
// CHART
// =========================

function updateChart() {

    const categoryTotals = {};


    expenses.forEach(function (expense) {

        if (!categoryTotals[expense.category]) {

            categoryTotals[expense.category] = 0;

        }


        categoryTotals[expense.category] +=
            Number(expense.amount);

    });


    expenseChart.data.labels =
        Object.keys(categoryTotals);


    expenseChart.data.datasets[0].data =
        Object.values(categoryTotals);


    expenseChart.update();
}


// =========================
// BUAT ID UNIK
// =========================

function generateId() {

    return Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 9);
}


// =========================
// FORMAT RUPIAH
// =========================

function formatRupiah(number) {

    return new Intl.NumberFormat("id-ID", {

        style: "currency",

        currency: "IDR",

        minimumFractionDigits: 0

    }).format(number);
}