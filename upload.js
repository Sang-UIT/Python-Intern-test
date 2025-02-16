// upload.js

const fileInput = document.getElementById("file-input");
const uploadButton = document.getElementById("upload-button");
const uploadStatus = document.getElementById("upload-status");

uploadButton.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
        uploadStatus.textContent = "Vui lòng chọn file CSV.";
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://127.0.0.1:8000/upload-csv/", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            uploadStatus.textContent = `File "${result.filename}" đã được upload và import thành công!`;


            updateChart();         
            updateTop10Table();    
            if (typeof updateScoreDistributionChart === 'function'){
                updateScoreDistributionChart(); 
            }

        } else {
            const errorData = await response.json();
            uploadStatus.textContent = `Lỗi: ${response.status} - ${errorData.detail}`;
        }
    } catch (error) {
        console.error("Error uploading file:", error);
        uploadStatus.textContent = "Có lỗi xảy ra khi upload file.";
    }
});