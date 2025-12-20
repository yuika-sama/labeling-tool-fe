// src/pages/Step3Export.jsx
import React from 'react';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';

const Step3Export = () => {
  const navigate = useNavigate();
  const { dataItems, config } = useProject();

  // Chuẩn bị dữ liệu để xuất (loại bỏ các trường thừa như fileObj, previewUrl)
  const exportData = {
    projectType: config.fileType,
    totalItems: dataItems.length,
    templateQuestions: config.templateQuestions.map(q => ({
      text: q.text,
      answerType: q.answerType,
      options: q.options || []
    })),
    items: dataItems.map(item => ({
      fileName: item.fileName,
      format: config.fileType,
      annotations: item.questions.map(q => ({
        question: q.text,
        answerType: q.answerType,
        options: q.options || [],
        answer: q.answer || ''
      }))
    }))
  };

  const jsonString = JSON.stringify(exportData, null, 2);

  const handleSave = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_labels_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              3
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Xem trước và Lưu</h1>
          </div>
          <p className="text-gray-600 ml-13">Kiểm tra dữ liệu và xuất file JSON</p>
        </div>
        
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => navigate('/step2')} 
            className="bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 shadow-md hover:shadow-lg transition-all flex items-center gap-2 border-2 border-gray-200"
          >
            <span>←</span> Quay lại chỉnh sửa
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            Thống kê dữ liệu
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-blue-600">{exportData.totalItems}</div>
              <div className="text-gray-600 text-sm mt-1">Tổng số file</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-purple-600">{exportData.projectType}</div>
              <div className="text-gray-600 text-sm mt-1">Loại dữ liệu</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-green-600">{config.templateQuestions.length}</div>
              <div className="text-gray-600 text-sm mt-1">Số câu hỏi</div>
            </div>
          </div>
        </div>

        {/* JSON Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            Xem trước dữ liệu JSON
          </h2>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-green-300 p-6 rounded-xl overflow-auto max-h-96 font-mono text-sm shadow-inner border-4 border-gray-700">
            <pre>{jsonString}</pre>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-10 py-4 rounded-2xl font-bold text-xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all flex items-center gap-3 mx-auto"
          >
            Lưu file JSON về máy
          </button>
          <p className="text-gray-500 mt-4 text-sm">File sẽ được tải xuống với tên: data_labels_[timestamp].json</p>
        </div>
      </div>
    </div>
  );
};

export default Step3Export;