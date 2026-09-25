let totalBudget =
    Number(localStorage.getItem("totalBudget")) || 0;

let spendingLimit =
    Number(localStorage.getItem("spendingLimit")) || 0;

let expenses =
    JSON.parse(localStorage.getItem("expenses")) || [];

let darkMode =
    localStorage.getItem("darkMode") === "true";


expenses = expenses.map(function (expense) {
    return {
        id: expense.id || generateId(),
        description: expense.description || "",
        amount: Number(expense.amount) || 0,
        date: expense.date || "",
        category: expense.category || "Lainnya"
    };
});

saveExpenses();


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

const chartElement =
    document.getElementById("expenseChart");

const chartLegend =
    document.getElementById("chartLegend");


let totalExpense = calculateTotalExpense();


if (darkMode) {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️ Light Mode";
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


expenseForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const description =
        document
            .getElementById("description")
            .value
            .trim();

    const amount =
        Number(
            document.getElementById("amount").value
        );

    const date =
        document.getElementById("date").value;

    const category =
        document.getElementById("category").value;


    if (
        description === "" ||
        !Number.isFinite(amount) ||
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

    saveExpenses();


    document.getElementById("totalExpense").textContent =
        formatRupiah(totalExpense);

    updateRemaining();
    updateTransactionList();
    updateChart();

    expenseForm.reset();

});


sortSelect.addEventListener(
    "change",
    updateTransactionList
);


function calculateTotalExpense() {

    return expenses.reduce(
        function (total, expense) {

            return total +
                Number(expense.amount || 0);

        },
        0
    );
}


function saveExpenses() {

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

}


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

        sortedExpenses.sort(
            function (a, b) {

                return b.amount - a.amount;

            }
        );

    }


    if (sortType === "lowest") {

        sortedExpenses.sort(
            function (a, b) {

                return a.amount - b.amount;

            }
        );

    }


    if (sortType === "category") {

        sortedExpenses.sort(
            function (a, b) {

                return a.category.localeCompare(
                    b.category
                );

            }
        );

    }


    if (sortType === "newest") {

        sortedExpenses.sort(
            function (a, b) {

                return new Date(b.date) -
                    new Date(a.date);

            }
        );

    }


    sortedExpenses.forEach(
        function (expense) {

            const transaction =
                document.createElement("div");

            transaction.className =
                "transaction-item";


            if (
                spendingLimit > 0 &&
                expense.amount >= spendingLimit
            ) {

                transaction.classList.add(
                    "warning"
                );

            }


            const formattedDate =
                new Date(
                    expense.date
                ).toLocaleDateString(
                    "id-ID",
                    {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                    }
                );


            const info =
                document.createElement("div");

            info.className =
                "transaction-info";


            const name =
                document.createElement("div");

            name.className =
                "transaction-name";

            name.textContent =
                expense.description;


            const category =
                document.createElement("div");

            category.className =
                "transaction-category";

            category.textContent =
                expense.category +
                " • " +
                formattedDate;


            const amount =
                document.createElement("div");

            amount.className =
                "transaction-amount";

            amount.textContent =
                formatRupiah(expense.amount);


            info.appendChild(name);
            info.appendChild(category);
            info.appendChild(amount);


            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "delete-button";

            deleteButton.textContent =
                "Hapus";


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteExpenseById(
                        expense.id
                    );

                }
            );


            transaction.appendChild(info);
            transaction.appendChild(deleteButton);

            transactionList.appendChild(transaction);

        }
    );

}


function deleteExpenseById(id) {

    const index =
        expenses.findIndex(
            function (expense) {

                return expense.id === id;

            }
        );


    if (index === -1) {
        return;
    }


    totalExpense -=
        Number(expenses[index].amount);


    expenses.splice(index, 1);

    saveExpenses();


    document.getElementById("totalExpense").textContent =
        formatRupiah(totalExpense);

    updateRemaining();
    updateTransactionList();
    updateChart();

}


function updateChart() {

    const categoryTotals = {};

    expenses.forEach(
        function (expense) {

            if (
                !categoryTotals[
                    expense.category
                ]
            ) {

                categoryTotals[
                    expense.category
                ] = 0;

            }

            categoryTotals[
                expense.category
            ] += Number(expense.amount);

        }
    );


    const categories =
        Object.keys(categoryTotals);


    if (categories.length === 0) {

        chartElement.style.background =
            "#e2e8f0";

        chartElement.innerHTML =
            "<span>Belum ada data</span>";

        chartLegend.innerHTML = "";

        return;

    }


    const colors = [
        "#6366f1",
        "#22c55e",
        "#f59e0b",
        "#ef4444",
        "#06b6d4",
        "#ec4899"
    ];


    const total =
        Object.values(categoryTotals)
            .reduce(
                function (sum, value) {

                    return sum + value;

                },
                0
            );


    let currentAngle = 0;

    const gradients = [];


    categories.forEach(
        function (category, index) {

            const value =
                categoryTotals[category];

            const percentage =
                (value / total) * 100;

            const start =
                currentAngle;

            const end =
                currentAngle + percentage;

            gradients.push(
                colors[index % colors.length] +
                " " +
                start +
                "% " +
                end +
                "%"
            );

            currentAngle = end;

        }
    );


    chartElement.style.background =
        "conic-gradient(" +
        gradients.join(", ") +
        ")";


    chartElement.innerHTML =
        "<span>" +
        formatRupiah(total) +
        "</span>";


    chartLegend.innerHTML = "";


    categories.forEach(
        function (category, index) {

            const item =
                document.createElement("div");

            item.className =
                "legend-item";


            const color =
                document.createElement("span");

            color.className =
                "legend-color";

            color.style.background =
                colors[index % colors.length];


            const text =
                document.createElement("span");

            const percentage =
                (
                    categoryTotals[category] /
                    total *
                    100
                ).toFixed(1);


            text.textContent =
                category +
                " (" +
                percentage +
                "%)";


            item.appendChild(color);
            item.appendChild(text);

            chartLegend.appendChild(item);

        }
    );

}


function generateId() {

    return Date.now().toString() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 9);

}


function formatRupiah(number) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(number);

}