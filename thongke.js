// thongke.js
const API_URL = "https://python-intern-test.onrender.com"; 

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

const scoreDistributionChartCanvas = document.getElementById("score-distribution-chart");
let scoreDistributionChart = null;

async function updateScoreDistributionChart() {
    const selectedSubject = document.getElementById("subject-select-thongke").value;
    const data = await fetchData(`/thongke/${selectedSubject}`); 

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
        type: 'bar', 
        data: {
            labels: labels,
            datasets: [{
                label: 'Số thí sinh',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.7)', 
                borderColor: 'rgba(75, 192, 192, 1)',    
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                     ticks: {
                        stepSize: 1 
                    }
                }
            }
        }
    });
}



document.addEventListener("DOMContentLoaded", updateScoreDistributionChart);
document.getElementById("subject-select-thongke").addEventListener("change", updateScoreDistributionChart); // Xóa dòng này