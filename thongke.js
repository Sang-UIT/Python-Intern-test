// thongke.js
const API_URL = "http://127.0.0.1:8000"; // Đổi nếu backend chạy ở port khác

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}
// --- Biểu đồ phổ điểm (Chart.js) ---
const scoreDistributionChartCanvas = document.getElementById("score-distribution-chart");
let scoreDistributionChart = null;

async function updateScoreDistributionChart() {
    const selectedSubject = document.getElementById("subject-select-thongke").value;
    const data = await fetchData(`/thongke/${selectedSubject}`); // Dùng endpoint thống kê

    if (!data || Object.keys(data).length === 0) {
        if(scoreDistributionChart){
            scoreDistributionChart.destroy();
            scoreDistributionChart = null;
        }
        scoreDistributionChartCanvas.style.display = "none";
        return;
    }
     scoreDistributionChartCanvas.style.display = "block";
    const labels = Object.keys(data);
    const values = Object.values(data);

    if (scoreDistributionChart) {
        scoreDistributionChart.destroy();
    }

    scoreDistributionChart = new Chart(scoreDistributionChartCanvas, {
        type: 'bar', // Hoặc 'line', 'pie', ...
        data: {
            labels: labels,
            datasets: [{
                label: 'Số thí sinh',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.7)', // Màu nền
                borderColor: 'rgba(75, 192, 192, 1)',    // Màu viền
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                     ticks: {
                        stepSize: 1 // Để hiển thị số nguyên
                    }
                }
            }
        }
    });
}

// Load chart khi trang tải và khi thay đổi môn học

document.addEventListener("DOMContentLoaded", updateScoreDistributionChart);
document.getElementById("subject-select-thongke").addEventListener("change", updateScoreDistributionChart); // Xóa dòng này