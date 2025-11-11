// ---------------- Logout ----------------
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("userRole");
    window.location.href = "login.html";
});

// ---------------- Manual Prediction ----------------
document.getElementById("predictionForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const studentData = Object.fromEntries(formData.entries());

    try {
        // Replace with actual backend API when integrated
        const response = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        const result = await response.json();
        document.getElementById("manualResult").innerText = `Predicted: ${result.prediction}`;
        updateCharts([result.prediction]);
    } catch (err) {
        alert("Error connecting to backend! (Demo mode can ignore this)");
    }
});

// ---------------- CSV Prediction ----------------
document.getElementById("uploadBtn")?.addEventListener("click", function () {
    const file = document.getElementById("csvFile").files[0];
    if (!file) { alert("Select a CSV file!"); return; }

    const reader = new FileReader();
    reader.onload = async function (e) {
        const text = e.target.result;
        const lines = text.split("\n").slice(1);
        const predictions = [];

        for (let line of lines) {
            const [name, studyHours, attendance, previousScore, sleepHours] = line.split(",");
            const studentData = { name, studyHours, attendance, previousScore, sleepHours };

            try {
                const res = await fetch("http://localhost:5000/predict", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(studentData)
                });
                const result = await res.json();
                predictions.push(result.prediction);
            } catch (err) { console.log(err); }
        }

        document.getElementById("csvResults").innerText = `Predictions: ${predictions.join(", ")}`;
        updateCharts(predictions);
    }
    reader.readAsText(file);
});

// ---------------- Charts ----------------
let barChart, pieChart;
function updateCharts(data) {
    const ctx1 = document.getElementById("barChart")?.getContext("2d");
    const ctx2 = document.getElementById("pieChart")?.getContext("2d");

    if (!ctx1 || !ctx2) return;

    if (barChart) barChart.destroy();
    if (pieChart) pieChart.destroy();

    // Bar Chart
    barChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: data.map((_, i) => `Student ${i + 1}`),
            datasets: [{
                label: 'Predicted Score',
                data: data,
                backgroundColor: '#007acc'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Pie Chart (Pass/Fail)
    const passCount = data.filter(d => d.toLowerCase() == "pass").length;
    const failCount = data.length - passCount;

    pieChart = new Chart(ctx2, {
        type: 'pie',
        data: {
            labels: ['Pass', 'Fail'],
            datasets: [{
                data: [passCount, failCount],
                backgroundColor: ['#007acc', '#003366']
            }]
        },
        options: { responsive: true }
    });
}
