// script.js

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

// --- Tra cứu điểm thi ---
const sbdInput = document.getElementById("sbd-input");
const searchButton = document.getElementById("search-button");
const searchResults = document.getElementById("search-results");

searchButton.addEventListener("click", async () => {
    const sbd = sbdInput.value.trim();
    if (!sbd) {
        alert("Vui lòng nhập số báo danh!");
        return;
    }

    const data = await fetchData(`/diemthi/${sbd}`);
    console.log("Data from /diemthi/:sbd:", data);
    if (data) {
        searchResults.innerHTML = `
            <p>SBD: ${data.sbd}</p>
            <p>Toán: ${data.toan !== null ? data.toan : "Không có dữ liệu"}</p>
            <p>Ngữ văn: ${data.ngu_van !== null ? data.ngu_van : "Không có dữ liệu"}</p>
            <p>Ngoại ngữ: ${data.ngoai_ngu !== null ? data.ngoai_ngu : "Không có dữ liệu"}</p>
            <p>Vật lý: ${data.vat_li !== null ? data.vat_li : "Không có dữ liệu"}</p>
            <p>Hóa học: ${data.hoa_hoc !== null ? data.hoa_hoc : "Không có dữ liệu"}</p>
            <p>Sinh học: ${data.sinh_hoc !== null ? data.sinh_hoc : "Không có dữ liệu"}</p>
            <p>Lịch sử: ${data.lich_su !== null ? data.lich_su : "Không có dữ liệu"}</p>
            <p>Địa lý: ${data.dia_li !== null ? data.dia_li : "Không có dữ liệu"}</p>
            <p>GDCD: ${data.gdcd !== null ? data.gdcd : "Không có dữ liệu"}</p>
        `;
    } else {
        searchResults.innerHTML = "<p>Không tìm thấy kết quả.</p>";
    }
});

// --- Lọc SBD theo mức điểm ---
const subjectSelect = document.getElementById("subject-select");
const levelSelect = document.getElementById("level-select");
const filterButton = document.getElementById("filter-button");
const filteredList = document.getElementById("filtered-list");

filterButton.addEventListener('click', async () => {
    const monHoc = subjectSelect.value;
    const mucDiem = levelSelect.value;

    const data = await fetchData(`/diemthi/filter/${monHoc}/${mucDiem}`);
    if (data && data.length > 0) {
        filteredList.innerHTML = data.map(sbd => `<li>${sbd}</li>`).join('');
    } else {
        filteredList.innerHTML = '<li>Không có thí sinh nào đạt mức điểm này.</li>';
    }
});

// --- Thống kê và vẽ biểu đồ ---
const levelChartCanvas = document.getElementById("level-chart");
let levelChart = null;

async function updateChart() {
    const selectedSubject = document.getElementById("subject-select").value;
    const data = await fetchData(`/thongke/${selectedSubject}`);

    if (!data || Object.keys(data).length === 0) {
        if (levelChart) {
            levelChart.destroy();
            levelChart = null;
        }
        levelChartCanvas.style.display = 'none';
        return;
    }

    levelChartCanvas.style.display = 'block';

    const labels = Object.keys(data);
    const values = Object.values(data);

    if (levelChart) {
        levelChart.destroy();
    }

    levelChart = new Chart(levelChartCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số thí sinh',
                data: values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
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

document.addEventListener("DOMContentLoaded", updateChart);
subjectSelect.addEventListener("change", updateChart); 

// --- Top 10 học sinh khối A ---
const topStudentsTable = document.getElementById("top-students-table");

async function updateTop10Table() {
    const data = await fetchData("/top10/khoiA");
    if (data) {
        const tbody = topStudentsTable.querySelector("tbody");
        tbody.innerHTML = "";

        data.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.sbd}</td>
                <td>${student.toan}</td>
                <td>${student.vat_li}</td>
                <td>${student.hoa_hoc}</td>
                <td>${student.tong_diem}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

document.addEventListener("DOMContentLoaded", updateTop10Table);