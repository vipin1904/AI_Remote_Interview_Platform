import axiosInstance from "../lib/axios";

export const questionApi = {
  getQuestions: async () => {
    const response = await axiosInstance.get("/questions");
    return response.data;
  },

  getQuestionBySlug: async (slug) => {
    const response = await axiosInstance.get(`/questions/${slug}`);
    return response.data;
  },

  getMyAttempts: async () => {
    const response = await axiosInstance.get("/attempts/my");
    return response.data;
  },

  getQuestionAttempts: async (slug) => {
    const response = await axiosInstance.get(`/attempts/question/${slug}`);
    return response.data;
  },
};
