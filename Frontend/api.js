const BASE_URL = "http://localhost:5000"; // Update this when you deploy your backend

export const API = {
    detectPlate: `${BASE_URL}/api/detect-plate`,
    uploadPhoto: `${BASE_URL}/api/upload-photo`,
    reportViolation: `${BASE_URL}/api/report-violation`,
    getReports: `${BASE_URL}/api/get-reports`,
};
