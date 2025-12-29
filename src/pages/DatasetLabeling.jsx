import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { datasetService } from '../services/datasetService';
import { answerService } from '../services/answerService';

const DatasetLabeling = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('preview'); // preview, questions, answers
  const [answers, setAnswers] = useState({});
  const [myAnswers, setMyAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [datasetData, myAnswersData] = await Promise.all([
        datasetService.getById(id),
        answerService.getMyAnswers(id),
      ]);
      setDataset(datasetData);
      setMyAnswers(myAnswersData);

      // Load existing answers vào state
      const existingAnswers = {};
      myAnswersData.forEach((answer) => {
        const key = `${answer.file_id || 'no-file'}_${answer.question_id}`;
        existingAnswers[key] = answer.answer_value;
      });
      setAnswers(existingAnswers);
    } catch (err) {
      setError('Không thể tải dataset');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    const currentFile = dataset.dataset_files?.[currentFileIndex];
    const key = `${currentFile?.id || 'no-file'}_${questionId}`;
    setAnswers({
      ...answers,
      [key]: value,
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const answersToSubmit = [];

      if (dataset.dataset_files && dataset.dataset_files.length > 0) {
        dataset.dataset_files.forEach((file) => {
          dataset.questions.forEach((question) => {
            const key = `${file.id}_${question.id}`;
            const answerValue = answers[key];

            if (answerValue !== undefined && answerValue !== '') {
              answersToSubmit.push({
                question_id: question.id,
                file_id: file.id,
                answer_value: String(answerValue),
              });
            }
          });
        });
      } else {
        dataset.questions.forEach((question) => {
          const key = `no-file_${question.id}`;
          const answerValue = answers[key];

          if (answerValue !== undefined && answerValue !== '') {
            answersToSubmit.push({
              question_id: question.id,
              file_id: null,
              answer_value: String(answerValue),
            });
          }
        });
      }

      if (answersToSubmit.length > 0) {
        // Gửi dataset_id và TẤT CẢ answers trong 1 submission
        await answerService.submitBatch({
          dataset_id: dataset.id,
          answers: answersToSubmit,
        });
        alert(`Đã lưu lượt trả lời thành công! (${answersToSubmit.length} câu trả lời)`);
        
        // Clear tất cả answers sau khi submit thành công để bắt đầu lượt mới
        setAnswers({});
        setMyAnswers([]);
        
        // Reload dataset để cập nhật thông tin
        const datasetData = await datasetService.getById(id);
        setDataset(datasetData);
      } else {
        alert('Vui lòng trả lời ít nhất 1 câu hỏi');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Không thể lưu câu trả lời: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (currentFileIndex < (dataset.dataset_files?.length || 0) - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  const currentFile = dataset.dataset_files?.[currentFileIndex];
  const hasFiles = dataset.dataset_files && dataset.dataset_files.length > 0;

  // Render preview based on file type
  const renderPreview = (file) => {
    if (!file) return null;

    if (dataset.file_type === 'image') {
      return <img src={file.file_url} alt={file.file_name} className="w-full h-auto max-h-[600px] object-contain rounded-lg" />;
    } else if (dataset.file_type === 'video') {
      return <video src={file.file_url} controls className="w-full max-h-[600px] rounded-lg" />;
    } else if (dataset.file_type === 'audio') {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">🎵</div>
          <audio src={file.file_url} controls className="w-full max-w-md" />
        </div>
      );
    } else if (dataset.file_type === 'csv') {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-lg mb-4">{file.file_name}</p>
          <a
            href={file.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium"
          >
            Mở file →
          </a>
        </div>
      );
    }
  };

  // Count answered questions for ALL files
  const getTotalAnsweredCount = () => {
    if (!dataset.questions) return 0;
    let count = 0;
    
    if (dataset.dataset_files && dataset.dataset_files.length > 0) {
      dataset.dataset_files.forEach((file) => {
        dataset.questions.forEach((q) => {
          const key = `${file.id}_${q.id}`;
          if (answers[key] && answers[key] !== '') count++;
        });
      });
    } else {
      dataset.questions.forEach((q) => {
        const key = `no-file_${q.id}`;
        if (answers[key] && answers[key] !== '') count++;
      });
    }
    return count;
  };

  // Count total questions for all files
  const getTotalQuestionsCount = () => {
    if (!dataset.questions) return 0;
    const fileCount = dataset.dataset_files?.length || 1;
    return dataset.questions.length * fileCount;
  };

  // Count answered questions for current file
  const getAnsweredCount = () => {
    if (!currentFile || !dataset.questions) return 0;
    let count = 0;
    dataset.questions.forEach((q) => {
      const key = `${currentFile.id}_${q.id}`;
      if (answers[key] && answers[key] !== '') count++;
    });
    return count;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <button
            onClick={() => navigate('/datasets')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2 font-medium"
          >
            ← Quay lại danh sách
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{dataset.name}</h1>
          <p className="text-gray-600">{dataset.description || 'Trả lời câu hỏi cho dataset'}</p>
        </div>

        {hasFiles ? (
          <>
            {/* File Navigation */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentFileIndex === 0}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
                >
                  ← Trước
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">File</p>
                  <p className="text-xl font-bold text-blue-600">
                    {currentFileIndex + 1} / {dataset.dataset_files.length}
                  </p>
                  <p className="text-sm text-gray-500 truncate max-w-xs" title={currentFile?.file_name}>
                    {currentFile?.file_name}
                  </p>
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={currentFileIndex === dataset.dataset_files.length - 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
                >
                  Sau →
                </button>
              </div>
            </div>

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
                  📁 Preview File
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`flex-1 py-4 px-6 font-semibold transition-all ${
                    activeTab === 'questions'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  📋 Danh sách câu hỏi ({dataset.questions?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('answers')}
                  className={`flex-1 py-4 px-6 font-semibold transition-all ${
                    activeTab === 'answers'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  ✍️ Nhập câu trả lời ({getTotalAnsweredCount()}/{getTotalQuestionsCount()})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-2xl shadow-lg p-6 min-h-[500px]">
              {/* Preview Tab */}
              {activeTab === 'preview' && currentFile && (
                <div className="flex flex-col items-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">{currentFile.file_name}</h3>
                  <div className="w-full max-w-4xl bg-gray-100 rounded-xl overflow-hidden p-4 flex items-center justify-center min-h-[400px]">
                    {renderPreview(currentFile)}
                  </div>
                  {currentFile.file_size && (
                    <p className="text-sm text-gray-500 mt-4">
                      Kích thước: {(currentFile.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              )}

              {/* Questions Tab */}
              {activeTab === 'questions' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Danh sách câu hỏi</h3>
                  
                  <div className="space-y-4">
                    {dataset.questions?.map((question, index) => {
                      const key = `${currentFile?.id || 'no-file'}_${question.id}`;
                      const isAnswered = answers[key] && answers[key] !== '';
                      
                      return (
                        <div key={question.id} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border-l-4 border-blue-400 shadow-sm">
                          <div className="flex items-start gap-3">
                            <span className="inline-block w-8 h-8 bg-blue-500 text-white rounded-full text-center text-sm leading-8 flex-shrink-0 font-semibold">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 text-lg mb-2">{question.question_text}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs bg-white border border-gray-300 rounded px-3 py-1 text-gray-600 font-medium">
                                  {question.answer_type === 'text' && '📄 Text'}
                                  {question.answer_type === 'binary-classification' && '✓ Binary'}
                                  {question.answer_type === 'single-choice' && '○ Single Choice'}
                                  {question.answer_type === 'multi-choice' && '☑ Multi Choice'}
                                  {question.answer_type === 'number' && '🔢 Number'}
                                </span>
                                {question.options && question.options.length > 0 && (
                                  <span className="text-xs bg-green-50 border border-green-300 rounded px-3 py-1 text-green-700">
                                    Options: {question.options.join(', ')}
                                  </span>
                                )}
                                {isAnswered && (
                                  <span className="text-xs bg-yellow-50 border border-yellow-300 rounded px-3 py-1 text-yellow-700">
                                    ✓ Đã trả lời
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {(!dataset.questions || dataset.questions.length === 0) && (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-gray-500 text-lg">Chưa có câu hỏi nào</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Answers Tab */}
              {activeTab === 'answers' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Nhập câu trả lời cho tất cả files</h3>
                    <span className="text-sm text-gray-600">
                      Đã trả lời: <span className="font-bold text-blue-600">{getTotalAnsweredCount()}</span>/{getTotalQuestionsCount()}
                    </span>
                  </div>
                  
                  {/* Hiển thị câu hỏi cho TẤT CẢ files */}
                  <div className="space-y-8">
                    {dataset.dataset_files && dataset.dataset_files.length > 0 ? (
                      dataset.dataset_files.map((file, fileIdx) => (
                        <div key={file.id} className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-purple-200">
                            <div className="flex items-center gap-3">
                              <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                File #{fileIdx + 1}
                              </span>
                              <h4 className="text-lg font-bold text-gray-800">📄 {file.file_name}</h4>
                            </div>
                            <button
                              onClick={() => {
                                setCurrentFileIndex(fileIdx);
                                setActiveTab('preview');
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                            >
                              👁 Xem file
                            </button>
                          </div>
                          
                          <div className="space-y-6">
                            {dataset.questions?.map((question, qIdx) => {
                              const key = `${file.id}_${question.id}`;
                              const value = answers[key] || '';

                              return (
                                <div key={question.id} className="bg-white p-5 rounded-xl border-l-4 border-blue-400 shadow-sm">
                                  <div className="flex items-start gap-3 mb-4">
                                    <span className="inline-block w-8 h-8 bg-blue-500 text-white rounded-full text-center text-sm leading-8 flex-shrink-0 font-semibold">
                                      {qIdx + 1}
                                    </span>
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-800 text-lg mb-1">{question.question_text}</p>
                                      <span className="text-xs bg-gray-100 border border-gray-300 rounded px-3 py-1 text-gray-600 inline-block">
                                        {question.answer_type}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="ml-11">
                                    {question.answer_type === 'text' && (
                                      <textarea
                                        value={value}
                                        onChange={(e) => {
                                          const newKey = `${file.id}_${question.id}`;
                                          setAnswers({ ...answers, [newKey]: e.target.value });
                                        }}
                                        rows="3"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        placeholder="Nhập câu trả lời..."
                                      />
                                    )}

                                    {question.answer_type === 'binary-classification' && (
                                      <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 px-4 py-3 rounded-lg hover:border-blue-500 transition-all flex-1">
                                          <input
                                            type="radio"
                                            name={key}
                                            value="Có"
                                            checked={value === 'Có'}
                                            onChange={(e) => {
                                              const newKey = `${file.id}_${question.id}`;
                                              setAnswers({ ...answers, [newKey]: e.target.value });
                                            }}
                                            className="w-5 h-5 text-blue-500"
                                          />
                                          <span className="font-medium">✓ Có</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 px-4 py-3 rounded-lg hover:border-blue-500 transition-all flex-1">
                                          <input
                                            type="radio"
                                            name={key}
                                            value="Không"
                                            checked={value === 'Không'}
                                            onChange={(e) => {
                                              const newKey = `${file.id}_${question.id}`;
                                              setAnswers({ ...answers, [newKey]: e.target.value });
                                            }}
                                            className="w-5 h-5 text-blue-500"
                                          />
                                          <span className="font-medium">✗ Không</span>
                                        </label>
                                      </div>
                                    )}

                                    {question.answer_type === 'single-choice' && question.options && (
                                      <div className="space-y-2">
                                        {question.options.map((option) => (
                                          <label
                                            key={option}
                                            className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 px-4 py-3 rounded-lg hover:border-blue-500 transition-all"
                                          >
                                            <input
                                              type="radio"
                                              name={key}
                                              value={option}
                                              checked={value === option}
                                              onChange={(e) => {
                                                const newKey = `${file.id}_${question.id}`;
                                                setAnswers({ ...answers, [newKey]: e.target.value });
                                              }}
                                              className="w-5 h-5 text-blue-500"
                                            />
                                            <span>{option}</span>
                                          </label>
                                        ))}
                                      </div>
                                    )}

                                    {question.answer_type === 'multi-choice' && question.options && (
                                      <div className="space-y-2">
                                        {question.options.map((option) => {
                                          const selectedOptions = value ? value.split(',') : [];
                                          return (
                                            <label
                                              key={option}
                                              className="flex items-center gap-2 cursor-pointer bg-white border-2 border-gray-200 px-4 py-3 rounded-lg hover:border-blue-500 transition-all"
                                            >
                                              <input
                                                type="checkbox"
                                                value={option}
                                                checked={selectedOptions.includes(option)}
                                                onChange={(e) => {
                                                  let newSelected = [...selectedOptions];
                                                  if (e.target.checked) {
                                                    newSelected.push(option);
                                                  } else {
                                                    newSelected = newSelected.filter((o) => o !== option);
                                                  }
                                                  const newKey = `${file.id}_${question.id}`;
                                                  setAnswers({ ...answers, [newKey]: newSelected.join(',') });
                                                }}
                                                className="w-5 h-5 text-blue-500"
                                              />
                                              <span>{option}</span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {question.answer_type === 'number' && (
                                      <input
                                        type="number"
                                        value={value}
                                        onChange={(e) => {
                                          const newKey = `${file.id}_${question.id}`;
                                          setAnswers({ ...answers, [newKey]: e.target.value });
                                        }}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        placeholder="Nhập số..."
                                      />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📂</div>
                        <p className="text-gray-500 text-lg">Không có file để trả lời</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="w-full mt-8 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {saving ? '⏳ Đang lưu...' : '💾 Lưu tất cả câu trả lời'}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📂</div>
            <p className="text-gray-500 text-lg mb-4">Dataset này chưa có file nào</p>
            <p className="text-gray-400">Vui lòng liên hệ admin để thêm files</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetLabeling;
