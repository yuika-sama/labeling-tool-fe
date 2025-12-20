import api from './api';

export const datasetService = {
  // Lấy tất cả datasets
  getAll: async () => {
    const response = await api.get('/datasets');
    return response.data.datasets;
  },

  // Lấy chi tiết dataset
  getById: async (id) => {
    const response = await api.get(`/datasets/${id}`);
    return response.data.dataset;
  },

  // Tạo dataset mới (admin only)
  create: async (datasetData) => {
    const response = await api.post('/datasets', datasetData);
    return response.data;
  },

  // Cập nhật dataset (admin only)
  update: async (id, datasetData) => {
    const response = await api.put(`/datasets/${id}`, datasetData);
    return response.data;
  },

  // Xóa dataset (admin only)
  delete: async (id) => {
    const response = await api.delete(`/datasets/${id}`);
    return response.data;
  },

  // Upload files cho dataset (admin only)
  uploadFiles: async (id, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post(`/datasets/${id}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Lấy tất cả câu trả lời cho dataset (admin only)
  getAnswers: async (id) => {
    const response = await api.get(`/datasets/${id}/answers`);
    return response.data; // Trả về toàn bộ { submissions, total_submissions, total_answers }
  },

  // Lấy files của dataset
  getFiles: async (id) => {
    const response = await api.get(`/datasets/${id}`);
    return response.data.dataset.dataset_files || [];
  },

  // Xóa file khỏi dataset
  deleteFile: async (datasetId, fileId) => {
    const response = await api.delete(`/datasets/${datasetId}/files/${fileId}`);
    return response.data;
  },
};
