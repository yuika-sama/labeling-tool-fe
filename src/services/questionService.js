import api from './api';

export const questionService = {
  // Lấy câu hỏi của dataset
  getByDataset: async (datasetId) => {
    const response = await api.get(`/questions/dataset/${datasetId}`);
    return response.data.questions;
  },

  // Thêm câu hỏi (admin only)
  create: async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data;
  },

  // Cập nhật câu hỏi (admin only)
  update: async (id, questionData) => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
  },

  // Xóa câu hỏi (admin only)
  delete: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },
};
