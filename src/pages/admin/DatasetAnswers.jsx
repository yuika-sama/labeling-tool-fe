import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { datasetService } from '../../services/datasetService';

const DatasetAnswers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [datasetData, answersData] = await Promise.all([
        datasetService.getById(id),
        datasetService.getAnswers(id),
      ]);
      console.log('Dataset data:', datasetData);
      console.log('Answers data:', answersData);
      console.log('Submissions:', answersData.submissions);
      setDataset(datasetData);
      setSubmissions(answersData.submissions || []);
    } catch (err) {
      console.error('Load data error:', err);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Export JSON theo submissions
  const handleExportJSON = () => {
    const exportData = {
      dataset: {
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        file_type: dataset.file_type,
        created_at: dataset.created_at,
      },
      questions: dataset.questions,
      files: dataset.dataset_files?.map(file => ({
        id: file.id,
        file_name: file.file_name,
        file_url: file.file_url,
        file_type: file.file_type,
      })) || [],
      statistics: {
        total_submissions: submissions.length,
        total_answers: submissions.reduce((sum, sub) => sum + sub.answers.length, 0),
        total_users: new Set(submissions.map(sub => sub.user_id)).size,
        total_questions: dataset.questions?.length || 0,
      },
      submissions: submissions.map(submission => ({
        submission_id: submission.id,
        submission_status: submission.status,
        started_at: submission.started_at,
        submitted_at: submission.submitted_at,
        user: {
          id: submission.users?.id,
          username: submission.users?.username,
          email: submission.users?.email,
        },
        answers: submission.answers.map(answer => ({
          answer_id: answer.id,
          question: {
            id: answer.questions?.id,
            text: answer.questions?.question_text,
            type: answer.questions?.answer_type,
            options: answer.questions?.options,
          },
          answer_value: answer.answer_value,
          file: answer.dataset_files ? {
            id: answer.dataset_files.id,
            file_name: answer.dataset_files.file_name,
            file_url: answer.dataset_files.file_url,
          } : null,
          answered_at: answer.created_at,
        })),
        total_answers: submission.answers.length,
      })),
    };

    // Tạo blob và tải file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataset.name}_submissions_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalAnswers = submissions.reduce((sum, sub) => sum + sub.answers.length, 0);
  const totalUsers = new Set(submissions.map(sub => sub.user_id)).size;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="flex-1">
              <button
                onClick={() => navigate('/datasets')}
                className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2 font-semibold"
              >
                ← Quay lại
              </button>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Câu trả lời: {dataset?.name}
              </h1>
              <p className="text-gray-600">
                Tổng số lượt trả lời: {submissions.length} - Từ {totalUsers} user - Tổng {totalAnswers} câu trả lời
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              disabled={submissions.length === 0}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 whitespace-nowrap"
              title="Tải xuống file JSON chứa tất cả lượt trả lời"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Tải xuống JSON
            </button>
          </div>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-blue-600">{submissions.length}</div>
            <div className="text-gray-600 text-sm mt-1">Lượt trả lời</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-purple-600">{totalAnswers}</div>
            <div className="text-gray-600 text-sm mt-1">Tổng câu trả lời</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-green-600">{totalUsers}</div>
            <div className="text-gray-600 text-sm mt-1">Số người tham gia</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-orange-600">
              {dataset?.questions?.length || 0}
            </div>
            <div className="text-gray-600 text-sm mt-1">Số câu hỏi</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              className="px-6 py-3 bg-white rounded-t-xl shadow-md font-semibold text-blue-600 border-b-2 border-blue-600"
            >
              Theo lượt trả lời
            </button>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">Chưa có lượt trả lời nào</p>
            </div>
          ) : (
            submissions.map((submission, idx) => (
              <div key={submission.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                        Lượt #{submissions.length - idx}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        submission.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {submission.status === 'completed' ? '✓ Hoàn thành' : '⏳ Đang làm'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {submission.users?.username || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500">{submission.users?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Bắt đầu: {new Date(submission.started_at).toLocaleString('vi-VN')}
                      {submission.submitted_at && ` • Hoàn thành: ${new Date(submission.submitted_at).toLocaleString('vi-VN')}`}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                    {submission.answers.length} câu trả lời
                  </span>
                </div>

                <div className="space-y-3">
                  {submission.answers.map((answer, answerIdx) => (
                    <div key={answer.id} className="flex gap-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border-l-4 border-blue-400">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {answerIdx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-1">
                          {answer.questions?.question_text}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-white border border-gray-300 rounded px-2 py-1 text-gray-600">
                            {answer.questions?.answer_type}
                          </span>
                          {answer.dataset_files && (
                            <span className="text-xs bg-purple-50 border border-purple-300 rounded px-2 py-1 text-purple-700">
                              📎 {answer.dataset_files.file_name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 bg-white px-3 py-2 rounded border border-gray-200">
                          <strong>Trả lời:</strong> {answer.answer_value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetAnswers;
