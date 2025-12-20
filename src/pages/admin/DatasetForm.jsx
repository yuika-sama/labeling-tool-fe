import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { datasetService } from '../../services/datasetService';
import { questionService } from '../../services/questionService';
import { v4 as uuidv4 } from 'uuid';

const DatasetForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file_type: 'image',
    is_published: false,
  });

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    answerType: 'text',
    options: '',
  });

  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      loadDataset();
    }
  }, [id]);

  const loadDataset = async () => {
    try {
      const dataset = await datasetService.getById(id);
      setFormData({
        name: dataset.name,
        description: dataset.description || '',
        file_type: dataset.file_type,
        is_published: dataset.is_published,
      });
      setQuestions(dataset.questions || []);
      setExistingFiles(dataset.dataset_files || []);
    } catch (err) {
      setError('Không thể tải dataset');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddQuestion = () => {
    if (!newQuestion.text.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    let questionOptions = [];
    if (
      (newQuestion.answerType === 'single-choice' ||
        newQuestion.answerType === 'multi-choice') &&
      newQuestion.options.trim()
    ) {
      questionOptions = newQuestion.options
        .split(',')
        .map((opt) => opt.trim())
        .filter((opt) => opt);
    }

    const question = {
      id: uuidv4(),
      question_text: newQuestion.text,
      answer_type: newQuestion.answerType,
      options: questionOptions.length > 0 ? questionOptions : null,
    };

    setQuestions([...questions, question]);
    setNewQuestion({ text: '', answerType: 'text', options: '' });
  };

  const handleRemoveQuestion = (qId) => {
    setQuestions(questions.filter((q) => q.id !== qId));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // Tạo preview URLs
    const previews = selectedFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type
    }));
    setFilePreviews(previews);
  };
  
  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const removeExistingFile = async (fileId) => {
    if (!window.confirm('Bạn có chắc muốn xóa file này?')) return;
    
    try {
      await datasetService.deleteFile(id, fileId);
      setExistingFiles(existingFiles.filter(f => f.id !== fileId));
      alert('Xóa file thành công');
    } catch (err) {
      alert('Không thể xóa file: ' + (err.response?.data?.error || err.message));
    }
  };
  
  const renderFilePreview = (preview, isExisting = false) => {
    const url = isExisting ? preview.file_url : preview.url;
    const name = isExisting ? preview.file_name : preview.name;
    
    if (formData.file_type === 'image') {
      return <img src={url} alt={name} className="w-full h-40 object-cover rounded-lg" />;
    } else if (formData.file_type === 'video') {
      return <video src={url} className="w-full h-40 object-cover rounded-lg" controls />;
    } else if (formData.file_type === 'audio') {
      return (
        <div className="flex items-center justify-center h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">🎵</div>
            <audio src={url} controls className="w-64" />
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-40 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg">
          <div className="text-center">
            <div className="text-5xl mb-2">📄</div>
            <p className="text-sm text-gray-600">{name}</p>
          </div>
        </div>
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let datasetId = id;

      if (isEditMode) {
        // Cập nhật dataset
        console.log('Updating dataset:', id);
        await datasetService.update(id, formData);

        // Xóa câu hỏi cũ và thêm mới (đơn giản hóa)
        const existingQuestions = await questionService.getByDataset(id);
        for (const q of existingQuestions) {
          await questionService.delete(q.id);
        }

        for (const q of questions) {
          await questionService.create({
            dataset_id: id,
            question_text: q.question_text,
            answer_type: q.answer_type,
            options: q.options,
          });
        }
      } else {
        // Tạo dataset mới
        console.log('Creating new dataset with data:', formData);
        const response = await datasetService.create({
          ...formData,
          questions: questions.map((q) => ({
            text: q.question_text,
            answerType: q.answer_type,
            options: q.options,
          })),
        });
        datasetId = response.dataset.id;
        console.log('Dataset created with ID:', datasetId);
      }

      // Upload files nếu có
      if (files.length > 0) {
        console.log('Uploading', files.length, 'files to dataset:', datasetId);
        try {
          const uploadResult = await datasetService.uploadFiles(datasetId, files);
          console.log('Files uploaded successfully:', uploadResult);
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError);
          setError('Dataset đã tạo nhưng có lỗi khi upload files: ' + (uploadError.response?.data?.error || uploadError.message));
          setLoading(false);
          return;
        }
      } else {
        console.log('No files to upload');
      }

      alert('Lưu dataset thành công!' + (files.length > 0 ? ` Đã upload ${files.length} files.` : ''));
      navigate('/datasets');
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể lưu dataset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="px-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isEditMode ? 'Chỉnh sửa Dataset' : 'Tạo Dataset Mới'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Cập nhật thông tin dataset' : 'Điền thông tin để tạo dataset mới'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin cơ bản */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin cơ bản</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Dataset *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="VD: Dataset nhận diện chó mèo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="Mô tả về dataset này..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại file *
                </label>
                <select
                  name="file_type"
                  value={formData.file_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                >
                  <option value="image">Hình ảnh</option>
                  <option value="video">Video</option>
                  <option value="audio">Âm thanh</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_published"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
                  Công bố dataset (cho phép user trả lời)
                </label>
              </div>
            </div>
          </div>

          {/* Câu hỏi */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Câu hỏi</h2>

            {/* Danh sách câu hỏi */}
            <div className="space-y-3 mb-4">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-semibold text-gray-500">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-800">{q.question_text}</p>
                    <p className="text-xs text-gray-500">
                      Loại: {q.answer_type}
                      {q.options && ` - Options: ${q.options.join(', ')}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Thêm câu hỏi mới */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-3">Thêm câu hỏi</h3>

              <div className="space-y-3">
                <input
                  type="text"
                  value={newQuestion.text}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, text: e.target.value })
                  }
                  placeholder="Nội dung câu hỏi"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                />

                <select
                  value={newQuestion.answerType}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, answerType: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                >
                  <option value="text">Text (văn bản tự do)</option>
                  <option value="binary-classification">Binary (Có/Không)</option>
                  <option value="single-choice">Single Choice (Chọn 1)</option>
                  <option value="multi-choice">Multi Choice (Chọn nhiều)</option>
                  <option value="number">Number (Số)</option>
                </select>

                {(newQuestion.answerType === 'single-choice' ||
                  newQuestion.answerType === 'multi-choice') && (
                  <input
                    type="text"
                    value={newQuestion.options}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, options: e.target.value })
                    }
                    placeholder="Các lựa chọn (cách nhau bởi dấu phẩy)"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                )}

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all"
                >
                  + Thêm câu hỏi
                </button>
              </div>
            </div>
          </div>

          {/* Upload files */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Files</h2>
            
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
              <div className="mb-4 text-5xl">📤</div>
              <p className="mb-2 text-gray-700">
                Chọn các file <strong className="text-blue-600">{formData.file_type}</strong> để upload
              </p>
              {isEditMode && existingFiles.length > 0 && (
                <p className="mb-4 text-sm text-green-600 font-medium">
                  ✅ Đã có {existingFiles.length} file trong dataset
                </p>
              )}
              <label className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
                <span>{isEditMode ? '➕ Thêm files' : 'Chọn files'}</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept={
                    formData.file_type === 'image'
                      ? 'image/*'
                      : formData.file_type === 'video'
                      ? 'video/*'
                      : formData.file_type === 'audio'
                      ? 'audio/*'
                      : '.csv'
                  }
                  className="hidden"
                />
              </label>
              <p className="mt-3 text-xs text-gray-500">
                Có thể chọn nhiều files cùng lúc (Ctrl/Cmd + Click)
              </p>
            </div>
            
            {/* Files đã upload (existing) */}
            {isEditMode && existingFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-4">
                  📁 Files đã upload ({existingFiles.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
                  {existingFiles.map((file) => (
                    <div key={file.id} className="relative group bg-gray-50 rounded-xl overflow-hidden border-2 border-green-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md">
                      {renderFilePreview(file, true)}
                      <div className="p-3 bg-white border-t">
                        <p className="text-sm text-gray-700 truncate font-medium" title={file.file_name}>
                          ✅ {file.file_name}
                        </p>
                        {file.file_size && (
                          <p className="text-xs text-gray-500">
                            {(file.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingFile(file.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 text-sm font-semibold shadow-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview files mới sẽ upload */}
            {filePreviews.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700">
                    🆕 Files mới sẽ upload ({filePreviews.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setFiles([]);
                      setFilePreviews([]);
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    🗑️ Xóa tất cả
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
                  {filePreviews.map((preview, index) => (
                    <div key={index} className="relative group bg-gray-50 rounded-xl overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
                      {renderFilePreview(preview, false)}
                      <div className="p-3 bg-white border-t">
                        <p className="text-sm text-gray-700 truncate font-medium" title={preview.name}>
                          {preview.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 text-sm font-semibold shadow-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/datasets')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Tạo Dataset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DatasetForm;
