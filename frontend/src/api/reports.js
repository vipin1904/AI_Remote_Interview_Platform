import axiosInstance from "../lib/axios";

export const getReport = async (sessionId) => {
  const response = await axiosInstance.get(`/reports/session/${sessionId}`);
  return response.data;
};

export const generateReport = async (sessionId, data = {}) => {
  const response = await axiosInstance.post(
    `/reports/session/${sessionId}/generate`,
    data
  );
  return response.data;
};

export const downloadReportPdf = async (sessionId, filename = "interview_report.pdf") => {
  const response = await axiosInstance.get(
    `/reports/session/${sessionId}/download`,
    {
      responseType: "blob",
    }
  );

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getPracticeRecommendations = async () => {
  const response = await axiosInstance.get(`/reports/practice/recommendations`);
  return response.data;
};
