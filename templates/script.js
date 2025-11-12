// ---------------- Logout ----------------
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("userRole");
    window.location.href = "login.html";
});

// ---------------- Toast Notifications ----------------
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

// ---------------- Manual Prediction ----------------
document.getElementById("predictionForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const studentData = Object.fromEntries(formData.entries());

    try {
        // Backend API
        const response = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        const result = await response.json();
        document.getElementById("manualResult").innerText = `Predicted: ${result.prediction}`;
        updateCharts([result.prediction]);
        showToast("✅ Prediction Successful!");
    } catch (err) {
        showToast("⚠️ Backend not connected! (Demo mode)", "error");
    }
});

// ---------------- CSV Prediction ----------------
document.getElementById("uploadBtn")?.addEventListener("click", function () {
    const file = document.getElementById("csvFile").files[0];
    if (!file) { showToast("❌ Select a CSV file!", "error"); return; }

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
        showToast("✅ CSV Predictions Done!");
    }
    reader.readAsText(file);
});

// ---------------- Train Model ----------------
document.getElementById("trainBtn")?.addEventListener("click", async () => {
    const status = document.getElementById("trainingStatus");
    status.innerText = "⏳ Training in progress...";
    status.style.color = "#007acc";

    // Simulate backend training
    setTimeout(() => {
        status.innerText = "✅ Training Completed!";
        status.style.color = "green";
        showToast("✅ Model Trained Successfully!");
        updateTrainChart();
    }, 2000);
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
            datasets: [{ label: 'Predicted Score', data, backgroundColor: '#007acc' }]
        },
        options: {
            responsive: true,
            animation: { duration: 1000, easing: 'easeInOutQuart' },
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });

    // Pie Chart (Pass/Fail)
    const passCount = data.filter(d => d.toLowerCase() == "pass").length;
    const failCount = data.length - passCount;

    pieChart = new Chart(ctx2, {
        type: 'pie',
        data: {
            labels: ['Pass', 'Fail'],
            datasets: [{ data: [passCount, failCount], backgroundColor: ['#007acc', '#003366'] }]
        },
        options: { responsive: true, animation: { animateScale: true, duration: 1000 } }
    });
}

// ---------------- Training Chart ----------------
function updateTrainChart() {
    const ctx = document.getElementById("trainChart")?.getContext("2d");
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["Epoch 1","Epoch 2","Epoch 3","Epoch 4","Epoch 5"],
            datasets: [{
                label: "Training Accuracy",
                data: [60, 70, 78, 85, 92],
                borderColor: "#007acc",
                backgroundColor: "rgba(0,122,204,0.2)",
                tension: 0.4
            }]
        },
        options: { responsive:true, plugins:{ legend:{display:true} } }
    });
}

// ---------------- Toast Styles ----------------
const toastStyle = document.createElement("style");
toastStyle.innerHTML = `
.toast {
    position: fixed;
    bottom: 30px;
    right: 30px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 9999;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    opacity: 0.95;
}
.toast.success { background-color: #007acc; }
.toast.error { background-color: #f44336; }
`;
document.head.appendChild(toastStyle);

