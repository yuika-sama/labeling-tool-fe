// src/pages/Step2Labeling.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { v4 as uuidv4 } from 'uuid';

const Step2Labeling = () => {
  const navigate = useNavigate();
  const { config, dataItems, addDataItems, updateDataItem } = useProject();
  
  // State cho tabs
  const [activeTab, setActiveTab] = useState('preview'); // preview, questions, answers
  
  // State cho modal thêm/chỉnh sửa câu hỏi
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [modalQuestionText, setModalQuestionText] = useState('');
  const [modalAnswerType, setModalAnswerType] = useState('text');
  const [modalOptions, setModalOptions] = useState('');

  // Xử lý khi chọn file
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Tạo object cho từng file
    const newItems = files.map(file => ({
      id: uuidv4(),
      fileObj: file, // Lưu file object để preview
      previewUrl: URL.createObjectURL(file),
      fileName: file.name,
      // Sao chép câu hỏi mẫu từ config vào từng item riêng biệt
      questions: config.templateQuestions.map(q => ({...q, id: uuidv4() }))
    }));

    addDataItems(newItems);
  };

  // Upload file thay thế cho 1 item
  const handleReplaceFile = (itemId, e) => {
    const file = e.target.files[0];
    if (file) {
      updateDataItem(itemId, {
        fileObj: file,
        previewUrl: URL.createObjectURL(file),
        fileName: file.name
      });
    }
  };

  // Sửa câu trả lời
  const handleAnswerChange = (itemId, questionId, newVal) => {
    const item = dataItems.find(i => i.id === itemId);
    const updatedQuestions = item.questions.map(q => 
      q.id === questionId ? { ...q, answer: newVal } : q
    );
    updateDataItem(itemId, { questions: updatedQuestions });
  };

  // Sửa nội dung câu hỏi (đề bài yêu cầu chỉnh sửa câu hỏi)
  const handleQuestionTextChange = (itemId, questionId, newText) => {
    const item = dataItems.find(i => i.id === itemId);
    const updatedQuestions = item.questions.map(q => 
      q.id === questionId ? { ...q, text: newText } : q
    );
    updateDataItem(itemId, { questions: updatedQuestions });
  };

  // Thêm câu hỏi riêng cho item này
  const handleAddCustomQuestion = (itemId) => {
    setCurrentItemId(itemId);
    setEditingQuestion(null);
    setModalQuestionText('');
    setModalAnswerType('text');
    setModalOptions('');
    setShowQuestionModal(true);
  };

  // Chỉnh sửa câu hỏi
  const handleEditQuestion = (itemId, question) => {
    setCurrentItemId(itemId);
    setEditingQuestion(question);
    setModalQuestionText(question.text);
    setModalAnswerType(question.answerType);
    setModalOptions(question.options ? question.options.join(', ') : '');
    setShowQuestionModal(true);
  };

  // Lưu câu hỏi từ modal
  const handleSaveQuestion = () => {
    if (!modalQuestionText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    const item = dataItems.find(i => i.id === currentItemId);
    let questionOptions = [];
    
    if ((modalAnswerType === 'single-choice' || modalAnswerType === 'multi-choice') && modalOptions.trim()) {
      questionOptions = modalOptions.split(',').map(opt => opt.trim()).filter(opt => opt);
    }

    if (editingQuestion) {
      // Cập nhật câu hỏi hiện tại
      const updatedQuestions = item.questions.map(q => 
        q.id === editingQuestion.id 
          ? { ...q, text: modalQuestionText, answerType: modalAnswerType, options: questionOptions, answer: '' }
          : q
      );
      updateDataItem(currentItemId, { questions: updatedQuestions });
    } else {
      // Thêm câu hỏi mới
      const newQ = { 
        id: uuidv4(), 
        text: modalQuestionText, 
        answer: '', 
        answerType: modalAnswerType,
        options: questionOptions
      };
      updateDataItem(currentItemId, { questions: [...item.questions, newQ] });
    }

    setShowQuestionModal(false);
  };

  // Xóa câu hỏi
  const handleRemoveQuestion = (itemId, questionId) => {
    const item = dataItems.find(i => i.id === itemId);
    const updatedQuestions = item.questions.filter(q => q.id !== questionId);
    updateDataItem(itemId, { questions: updatedQuestions });
  };

  // Sửa answer type của câu hỏi
  const handleAnswerTypeChange = (itemId, questionId, newType) => {
    const item = dataItems.find(i => i.id === itemId);
    const updatedQuestions = item.questions.map(q => {
      if (q.id === questionId) {
        // Reset answer khi đổi type
        return { ...q, answerType: newType, answer: '' };
      }
      return q;
    });
    updateDataItem(itemId, { questions: updatedQuestions });
  };

  // Sửa options của câu hỏi
  const handleOptionsChange = (itemId, questionId, newOptions) => {
    const item = dataItems.find(i => i.id === itemId);
    const updatedQuestions = item.questions.map(q => 
      q.id === questionId ? { ...q, options: newOptions, answer: '' } : q
    );
    updateDataItem(itemId, { questions: updatedQuestions });
  };

  // Render input tùy theo loại câu trả lời
  const renderAnswerInput = (item, q) => {
    const commonClasses = "w-full border-2 border-gray-200 p-2 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-700";
    
    switch(q.answerType) {
      case 'binary-classification':
        return (
          <div className="flex gap-2">
            <label className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 px-3 py-2 rounded-lg hover:border-blue-500 transition-all flex-1">
              <input 
                type="radio" 
                name={`${item.id}-${q.id}`}
                value="yes"
                checked={q.answer === 'yes'}
                onChange={(e) => handleAnswerChange(item.id, q.id, e.target.value)}
                className="text-blue-500"
              />
              <span className="text-gray-700">✓ Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 px-3 py-2 rounded-lg hover:border-blue-500 transition-all flex-1">
              <input 
                type="radio" 
                name={`${item.id}-${q.id}`}
                value="no"
                checked={q.answer === 'no'}
                onChange={(e) => handleAnswerChange(item.id, q.id, e.target.value)}
                className="text-blue-500"
              />
              <span className="text-gray-700">✗ No</span>
            </label>
          </div>
        );
      
      case 'single-choice':
        return (
          <div className="space-y-2">
            {q.options && q.options.length > 0 ? (
              q.options.map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 px-3 py-2 rounded-lg hover:border-blue-500 transition-all">
                  <input 
                    type="radio" 
                    name={`${item.id}-${q.id}`}
                    value={opt}
                    checked={q.answer === opt}
                    onChange={(e) => handleAnswerChange(item.id, q.id, e.target.value)}
                    className="text-blue-500"
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))
            ) : (
              <div className="text-xs text-gray-500 italic p-2 bg-yellow-50 rounded border border-yellow-200">
                ⚠️ Chưa có lựa chọn nào. Vui lòng thêm options ở Step 1 hoặc chỉnh sửa câu hỏi.
              </div>
            )}
          </div>
        );
      
      case 'multi-choice':
        return (
          <div className="space-y-2">
            {q.options && q.options.length > 0 ? (
              q.options.map((opt, idx) => {
                const selectedOptions = q.answer ? q.answer.split(',').map(s => s.trim()) : [];
                const isChecked = selectedOptions.includes(opt);
                
                return (
                  <label key={idx} className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 px-3 py-2 rounded-lg hover:border-blue-500 transition-all">
                    <input 
                      type="checkbox" 
                      value={opt}
                      checked={isChecked}
                      onChange={(e) => {
                        let newSelected = [...selectedOptions];
                        if (e.target.checked) {
                          newSelected.push(opt);
                        } else {
                          newSelected = newSelected.filter(s => s !== opt);
                        }
                        handleAnswerChange(item.id, q.id, newSelected.join(', '));
                      }}
                      className="text-blue-500"
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                );
              })
            ) : (
              <div className="text-xs text-gray-500 italic p-2 bg-yellow-50 rounded border border-yellow-200">
                Chưa có lựa chọn nào. Vui lòng thêm options ở Step 1 hoặc chỉnh sửa câu hỏi.
              </div>
            )}
          </div>
        );
      
      case 'likert-scale':
        return (
          <div className="flex gap-2 justify-between">
            {[1, 2, 3, 4, 5].map(star => (
              <label 
                key={star} 
                className={`flex flex-col items-center cursor-pointer px-3 py-2 rounded-lg transition-all flex-1 ${
                  q.answer == star 
                    ? 'bg-yellow-100 border-2 border-yellow-500' 
                    : 'bg-white border-2 border-gray-200 hover:border-yellow-500'
                }`}
              >
                <input 
                  type="radio" 
                  name={`${item.id}-${q.id}`}
                  value={star}
                  checked={q.answer == star}
                  onChange={(e) => handleAnswerChange(item.id, q.id, e.target.value)}
                  className="hidden"
                />
                <span className={`text-2xl ${q.answer == star ? 'text-yellow-500' : 'text-gray-300'}`}>⭐</span>
                <span className={`text-xs font-semibold ${q.answer == star ? 'text-yellow-700' : 'text-gray-600'}`}>{star}</span>
              </label>
            ))}
          </div>
        );
      
      default:
        return (
          <textarea 
            value={q.answer || ''}
            onChange={(e) => handleAnswerChange(item.id, q.id, e.target.value)}
            placeholder="Nhập câu trả lời..."
            rows="3"
            className={commonClasses}
          />
        );
    }
  };

  // Render vùng preview tùy theo loại file
  const renderPreview = (item) => {
    if (config.fileType === 'image') {
      return <img src={item.previewUrl} alt="preview" className="w-full h-48 object-contain bg-black" />;
    } else if (config.fileType === 'video') {
      return <video src={item.previewUrl} controls className="w-full h-48 bg-black" />;
    } else if (config.fileType === 'audio') {
      return <audio src={item.previewUrl} controls className="w-full mt-4" />;
    } else {
      return <div className="p-4 bg-gray-200 text-center">{item.fileName} (CSV/Text)</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Gán nhãn dữ liệu</h1>
                <p className="text-gray-600">Định dạng: <span className="font-semibold text-green-600">{config.fileType}</span></p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/step1')} 
                className="bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 shadow-md hover:shadow-lg transition-all flex items-center gap-2 border-2 border-gray-200"
              >
                <span>←</span> Quay lại
              </button>
              <button 
                onClick={() => navigate('/step3')} 
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
              >
                Tiếp theo <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Vùng kéo thả / chọn file */}
        <div className="bg-white border-2 border-dashed border-blue-300 rounded-2xl p-10 text-center mb-8 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer shadow-lg">
          <div className="mb-4 text-6xl">📤</div>
          <p className="mb-4 text-gray-700 text-lg">Chọn các file <strong className="text-blue-600">{config.fileType}</strong> để thêm vào danh sách</p>
          <label className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
            <span>Chọn file</span>
            <input 
              type="file" 
              multiple 
              accept={config.fileType === 'image' ? 'image/*' : config.fileType === 'video' ? 'video/*' : config.fileType === 'audio' ? 'audio/*' : '.csv'}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Danh sách Item Card */}
        {dataItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📂</div>
            <p className="text-gray-500 text-lg">Chưa có file nào được thêm vào</p>
            <p className="text-gray-400">Hãy tải lên file để bắt đầu gán nhãn</p>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="bg-white rounded-t-2xl shadow-lg">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex-1 py-4 px-6 font-semibold transition-all ${
                    activeTab === 'preview'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  📁 Preview Data
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`flex-1 py-4 px-6 font-semibold transition-all ${
                    activeTab === 'questions'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  📋 Danh sách câu hỏi
                </button>
                <button
                  onClick={() => setActiveTab('answers')}
                  className={`flex-1 py-4 px-6 font-semibold transition-all ${
                    activeTab === 'answers'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  ✍️ Nhập câu trả lời
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-2xl shadow-lg p-6 min-h-[500px]">
              {activeTab === 'preview' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Tất cả files ({dataItems.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dataItems.map((item) => (
                      <div key={item.id} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border-2 border-gray-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3 truncate">{item.fileName}</h4>
                        <div className="bg-white rounded-lg overflow-hidden mb-3">
                          {renderPreview(item)}
                        </div>
                        <label className="block text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg cursor-pointer shadow hover:from-blue-600 hover:to-blue-700 font-medium transition-all text-sm">
                          🔄 Thay file
                          <input 
                            type="file" 
                            className="hidden" 
                            accept={config.fileType === 'image' ? 'image/*' : config.fileType === 'video' ? 'video/*' : config.fileType === 'audio' ? 'audio/*' : '.csv'}
                            onChange={(e) => handleReplaceFile(item.id, e)} 
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'questions' && (
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Danh sách câu hỏi cho tất cả files</h3>
                  
                  {dataItems.map((item) => (
                    <div key={item.id} className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold text-gray-800">📄 {item.fileName}</h4>
                        <button 
                          onClick={() => handleAddCustomQuestion(item.id)}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all text-sm"
                        >
                          + Thêm câu hỏi
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {item.questions.map((q, idx) => (
                      <div key={q.id} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border-l-4 border-blue-400 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="inline-block w-8 h-8 bg-blue-500 text-white rounded-full text-center text-sm leading-8 flex-shrink-0 font-semibold">
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 text-lg mb-2">{q.text}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs bg-white border border-gray-300 rounded px-3 py-1 text-gray-600 font-medium">
                                  {q.answerType === 'binary-classification' && '✓ Binary'}
                                  {q.answerType === 'single-choice' && '○ Single Choice'}
                                  {q.answerType === 'multi-choice' && '☑ Multi Choice'}
                                  {q.answerType === 'bounding-box' && '▭ Bounding Box'}
                                  {q.answerType === 'polygon' && '⬡ Polygon'}
                                  {q.answerType === 'segmentation' && '▨ Segmentation'}
                                  {q.answerType === 'keypoints' && '⊙ Keypoints'}
                                  {q.answerType === 'ner' && '🏷 NER'}
                                  {q.answerType === 'text-generation' && '✎ Text Generation'}
                                  {q.answerType === 'relationship' && '↔ Relationship'}
                                  {q.answerType === 'audio-transcription' && '🎤 Audio Transcription'}
                                  {q.answerType === 'ocr' && '📝 OCR'}
                                  {q.answerType === 'pairwise-comparison' && '⚖ Pairwise'}
                                  {q.answerType === 'likert-scale' && '⭐ Likert'}
                                  {q.answerType === 'text' && '📄 Text'}
                                </span>
                                {q.options && q.options.length > 0 && (
                                  <span className="text-xs bg-green-50 border border-green-300 rounded px-3 py-1 text-green-700">
                                    Options: {q.options.join(', ')}
                                  </span>
                                )}
                                {q.answer && (
                                  <span className="text-xs bg-yellow-50 border border-yellow-300 rounded px-3 py-1 text-yellow-700">
                                    ✓ Đã trả lời
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditQuestion(item.id, q)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-all"
                            >
                              ✏ Sửa
                            </button>
                            <button
                              onClick={() => handleRemoveQuestion(item.id, q.id)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-all"
                            >
                              🗑 Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'answers' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Nhập câu trả lời cho tất cả files</h3>
                    <button
                      onClick={() => {
                        if (window.confirm('Lưu toàn bộ câu trả lời?')) {
                          alert('Đã lưu thành công!');
                        }
                      }}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      💾 Lưu tất cả
                    </button>
                  </div>
                  
                  {dataItems.map((item) => (
                    <div key={item.id} className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-6 border-2 border-green-200 shadow-sm">
                      <h4 className="text-lg font-bold text-gray-800 mb-4">📄 {item.fileName}</h4>
                      
                      <div className="space-y-6">
                        {item.questions.map((q, idx) => (
                          <div key={q.id} className="bg-white p-5 rounded-xl border-l-4 border-blue-400 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                              <span className="inline-block w-8 h-8 bg-blue-500 text-white rounded-full text-center text-sm leading-8 flex-shrink-0 font-semibold">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 text-lg mb-1">{q.text}</p>
                                <span className="text-xs bg-gray-100 border border-gray-300 rounded px-3 py-1 text-gray-600 inline-block">
                                  {q.answerType}
                                </span>
                              </div>
                            </div>
                            
                            <div className="ml-11">
                              {renderAnswerInput(item, q)}
                            </div>
                          </div>
                        ))}
                        
                        {item.questions.length === 0 && (
                          <div className="text-center py-8 bg-gray-50 rounded-xl">
                            <p className="text-gray-500">Chưa có câu hỏi cho file này</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal thêm/sửa câu hỏi */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
              </h2>
              
              {/* Nội dung câu hỏi */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung câu hỏi:</label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="Nhập nội dung câu hỏi..."
                  value={modalQuestionText}
                  onChange={(e) => setModalQuestionText(e.target.value)}
                />
              </div>

              {/* Định dạng câu trả lời */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Định dạng câu trả lời:</label>
                <select 
                  className="w-full border-2 border-gray-200 p-3 rounded-xl text-gray-700 bg-gray-50 hover:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none cursor-pointer"
                  value={modalAnswerType}
                  onChange={(e) => setModalAnswerType(e.target.value)}
                >
                  <optgroup label="Phân loại">
                    <option value="binary-classification">Phân loại nhị phân (Yes/No)</option>
                    <option value="single-choice">Đơn lựa chọn (Single Choice)</option>
                    <option value="multi-choice">Đa lựa chọn (Multi Choice)</option>
                  </optgroup>
                  <optgroup label="Computer Vision">
                    <option value="bounding-box">Bounding Box</option>
                    <option value="polygon">Polygon</option>
                    <option value="segmentation">Segmentation</option>
                    <option value="keypoints">Keypoints</option>
                  </optgroup>
                  <optgroup label="NLP">
                    <option value="ner">Named Entity Recognition</option>
                    <option value="text-generation">Text Generation</option>
                    <option value="relationship">Relationship Extraction</option>
                  </optgroup>
                  <optgroup label="Transcription">
                    <option value="audio-transcription">Audio Transcription</option>
                    <option value="ocr">OCR</option>
                  </optgroup>
                  <optgroup label="RLHF">
                    <option value="pairwise-comparison">Pairwise Comparison</option>
                    <option value="likert-scale">Likert Scale</option>
                  </optgroup>
                  <optgroup label="Khác">
                    <option value="text">Text tự do</option>
                  </optgroup>
                </select>
              </div>

              {/* Options cho Single/Multi Choice */}
              {(modalAnswerType === 'single-choice' || modalAnswerType === 'multi-choice') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Các lựa chọn (phân cách bằng dấu phẩy):
                  </label>
                  <input
                    type="text"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="VD: Vui, Buồn, Giận dữ, Trung tính"
                    value={modalOptions}
                    onChange={(e) => setModalOptions(e.target.value)}
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
                >
                  {editingQuestion ? 'Cập nhật' : 'Thêm câu hỏi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2Labeling;