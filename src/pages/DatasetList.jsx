import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { datasetService } from '../services/datasetService';

const DatasetList = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const data = await datasetService.getAll();
      setDatasets(data);
    } catch (err) {
      setError('Không thể tải danh sách datasets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa dataset này?')) {
      return;
    }

    try {
      await datasetService.delete(id);
      setDatasets(datasets.filter((d) => d.id !== id));
    } catch (err) {
      alert('Không thể xóa dataset: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleTogglePublish = async (dataset) => {
    try {
      await datasetService.update(dataset.id, {
        is_published: !dataset.is_published,
      });
      loadDatasets();
    } catch (err) {
      alert('Không thể cập nhật trạng thái: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Danh sách Datasets
              </h1>
              <p className="text-gray-600">
                {isAdmin() ? 'Quản lý datasets và xem câu trả lời' : 'Chọn dataset để trả lời câu hỏi'}
              </p>
            </div>
            {isAdmin() && (
              <button
                onClick={() => navigate('/admin/datasets/create')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                + Tạo Dataset Mới
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Dataset Grid */}
        {datasets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">Chưa có dataset nào</p>
            {isAdmin() && (
              <button
                onClick={() => navigate('/admin/datasets/create')}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Tạo dataset đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex-1">
                    {dataset.name}
                  </h3>
                  {isAdmin() && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        dataset.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {dataset.is_published ? 'Published' : 'Draft'}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {dataset.description || 'Không có mô tả'}
                </p>

                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    {dataset.file_type}
                  </span>
                  <span>•</span>
                  <span>{dataset.questions?.length || 0} câu hỏi</span>
                </div>

                <div className="text-xs text-gray-400 mb-4">
                  Tạo bởi: {dataset.users?.username || 'Unknown'}
                </div>

                <div className="flex gap-2">
                  {isAdmin() ? (
                    <>
                      <button
                        onClick={() => navigate(`/admin/datasets/${dataset.id}/edit`)}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => navigate(`/admin/datasets/${dataset.id}/answers`)}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all"
                      >
                        Xem câu trả lời
                      </button>
                      <button
                        onClick={() => handleTogglePublish(dataset)}
                        className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-all"
                        title={dataset.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {dataset.is_published ? '👁️' : '🔒'}
                      </button>
                      <button
                        onClick={() => handleDelete(dataset.id)}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all"
                      >
                        🗑️
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate(`/datasets/${dataset.id}/label`)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                    >
                      Trả lời câu hỏi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetList;
