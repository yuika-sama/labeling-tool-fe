// src/pages/Step1Config.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { v4 as uuidv4 } from 'uuid';

const Step1Config = () => {
  const navigate = useNavigate();
  const { config, updateConfig, setDataItems } = useProject();
  
  const [localType, setLocalType] = useState(config.fileType);
  const [questions, setQuestions] = useState(config.templateQuestions);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [selectedAnswerType, setSelectedAnswerType] = useState('binary-classification');
  const [options, setOptions] = useState('');

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    
    // Xử lý options nếu có
    let questionOptions = [];
    if (options.trim()) {
      questionOptions = options.split(',').map(opt => opt.trim()).filter(opt => opt);
    }
    
    setQuestions([
      ...questions,
      { 
        id: uuidv4(), 
        text: newQuestionText, 
        answerType: selectedAnswerType,
        options: questionOptions,
        answer: '' 
      }
    ]);
    setNewQuestionText('');
    setOptions('');
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleNext = () => {
    // Lưu cấu hình vào Context
    updateConfig({
      fileType: localType,
      templateQuestions: questions
    });
    // Reset data cũ nếu muốn bắt đầu mới hoàn toàn
    setDataItems([]); 
    navigate('/step2');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              1
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Cấu hình Dự án</h1>
          </div>
          <p className="text-gray-600 ml-13">Thiết lập loại dữ liệu và câu hỏi gán nhãn</p>
        </div>
        
        {/* Chọn định dạng file */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow">
          <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">📁</span>
            Chọn định dạng file:
          </label>
          <select 
            className="w-full border-2 border-gray-200 p-3 rounded-xl text-gray-700 bg-gray-50 hover:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none cursor-pointer"
            value={localType}
            onChange={(e) => setLocalType(e.target.value)}
          >
            <option value="image">Hình ảnh (Image)</option>
            <option value="video">Video</option>
            <option value="audio">Âm thanh (Audio)</option>
            <option value="csv">Tệp CSV</option>
          </select>
        </div>

        {/* Tạo câu hỏi mẫu */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">❓</span>
            Định nghĩa câu hỏi gán nhãn:
          </label>
          
          {/* Nội dung câu hỏi */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung câu hỏi:</label>
            <input
              type="text"
              className="w-full border-2 border-gray-200 p-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="Nhập nội dung câu hỏi (VD: Ảnh này chứa con vật gì?)"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
            />
          </div>

          {/* Chọn định dạng câu trả lời */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Định dạng câu trả lời:</label>
            <select 
              className="w-full border-2 border-gray-200 p-3 rounded-xl text-gray-700 bg-gray-50 hover:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none cursor-pointer"
              value={selectedAnswerType}
              onChange={(e) => setSelectedAnswerType(e.target.value)}
            >
              <optgroup label="📊 Phân loại (Classification)">
                <option value="binary-classification">Phân loại nhị phân (Yes/No)</option>
                <option value="single-choice">Đơn lựa chọn (Single Choice)</option>
                <option value="multi-choice">Đa lựa chọn (Multi Choice)</option>
              </optgroup>
              <optgroup label="🖼️ Thị giác máy tính (Computer Vision)">
                <option value="bounding-box">Bounding Box (Hộp giới hạn)</option>
                <option value="polygon">Polygon (Đa giác)</option>
                <option value="segmentation">Segmentation (Phân đoạn)</option>
                <option value="keypoints">Keypoints (Điểm chốt)</option>
              </optgroup>
              <optgroup label="📝 Xử lý ngôn ngữ (NLP)">
                <option value="ner">Named Entity Recognition (NER)</option>
                <option value="text-generation">Text Generation/Correction</option>
                <option value="relationship">Relationship Extraction</option>
              </optgroup>
              <optgroup label="🎤 Chuyển đổi (Transcription)">
                <option value="audio-transcription">Audio Transcription</option>
                <option value="ocr">OCR (Optical Character Recognition)</option>
              </optgroup>
              <optgroup label="⭐ Đánh giá & Xếp hạng (RLHF)">
                <option value="pairwise-comparison">Pairwise Comparison</option>
                <option value="likert-scale">Likert Scale (1-5 sao)</option>
              </optgroup>
              <optgroup label="📋 Khác">
                <option value="text">Text tự do</option>
              </optgroup>
            </select>
          </div>

          {/* Tùy chọn cho các loại cần options */}
          {(selectedAnswerType === 'single-choice' || selectedAnswerType === 'multi-choice') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Các lựa chọn (phân cách bằng dấu phẩy):
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 p-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="VD: Vui, Buồn, Giận dữ, Trung tính"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end">
            <button 
              onClick={handleAddQuestion}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
            >
              + Thêm câu hỏi
            </button>
          </div>

          {/* Danh sách câu hỏi đã tạo */}
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <h3 className="text-md font-semibold text-gray-700 mb-3">Danh sách câu hỏi đã tạo:</h3>
            {questions.length > 0 ? (
              <ul className="space-y-3">
                {questions.map((q, index) => {
                  const getAnswerTypeLabel = (type) => {
                    const labels = {
                      'binary-classification': '✓ Phân loại nhị phân',
                      'single-choice': ' Đơn lựa chọn',
                      'multi-choice': ' Đa lựa chọn',
                      'bounding-box': ' Bounding Box',
                      'polygon': ' Polygon',
                      'segmentation': ' Segmentation',
                      'keypoints': ' Keypoints',
                      'ner': ' NER',
                      'text-generation': ' Text Generation',
                      'relationship': ' Relationship',
                      'audio-transcription': ' Audio Transcription',
                      'ocr': ' OCR',
                      'pairwise-comparison': ' Pairwise Comparison',
                      'likert-scale': ' Likert Scale',
                      'text': ' Text'
                    };
                    return labels[type] || type;
                  };

                  return (
                    <li key={q.id} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-block w-6 h-6 bg-blue-500 text-white rounded-full text-center text-sm leading-6">{index + 1}</span>
                            <span className="text-gray-800 font-semibold">{q.text}</span>
                          </div>
                          <div className="ml-8">
                            <span className="inline-block bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-600 border border-gray-300">
                              {getAnswerTypeLabel(q.answerType)}
                            </span>
                            {q.options && q.options.length > 0 && (
                              <div className="mt-2 text-xs text-gray-600">
                                <span className="font-semibold">Lựa chọn:</span> {q.options.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="bg-white text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-medium transition-all text-sm ml-2 border border-red-300 hover:border-red-400"
                        >
                          ✕ Xóa
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                <p className="text-lg">📝 Chưa có câu hỏi nào</p>
                <p className="text-sm">Thêm câu hỏi để bắt đầu</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button 
            onClick={handleNext}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
          >
            Tiếp theo <span className="text-xl">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1Config;