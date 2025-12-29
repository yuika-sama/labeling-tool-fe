import api from './api';

export const answerService = {
  // Submit câu trả lời
  submit: async (answerData) => {
    const response = await api.post('/answers', answerData);
    return response.data;
  },

  // Submit nhiều câu trả lời
  submitBatch: async (data) => {
    // data có cấu trúc: { dataset_id, answers: [...] }
    const response = await api.post('/answers/batch', data);
    return response.data;
  },

  // Lấy câu trả lời của user cho dataset
  getMyAnswers: async (datasetId) => {
    const response = await api.get(`/answers/my-answers/${datasetId}`);
    return response.data.answers;
  },

  // Xóa câu trả lời
  delete: async (id) => {
    const response = await api.delete(`/answers/${id}`);
    return response.data;
  },
};
