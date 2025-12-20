// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import DatasetList from './pages/DatasetList';
import DatasetLabeling from './pages/DatasetLabeling';
import DatasetForm from './pages/admin/DatasetForm';
import DatasetAnswers from './pages/admin/DatasetAnswers';
import Step1Config from './pages/Step1Config';
import Step2Labeling from './pages/Step2Labeling';
import Step3Export from './pages/Step3Export';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white border-b p-4 shadow-sm">
      <div className="px-8 flex justify-between items-center">
        <div className="font-bold text-xl text-blue-600">
          Tool Gán Nhãn Dữ Liệu
        </div>
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {user?.username}
              {user?.role === 'admin' && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                  Admin
                </span>
              )}
            </span>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            <Navbar />
            <div className="w-full">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/datasets" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/datasets"
                  element={
                    <ProtectedRoute>
                      <DatasetList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/datasets/:id/label"
                  element={
                    <ProtectedRoute>
                      <DatasetLabeling />
                    </ProtectedRoute>
                  }
                />

                {/* Admin only routes */}
                <Route
                  path="/admin/datasets/create"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <DatasetForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/datasets/:id/edit"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <DatasetForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/datasets/:id/answers"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <DatasetAnswers />
                    </ProtectedRoute>
                  }
                />

                {/* Legacy routes (optional - giữ lại nếu muốn dùng local mode) */}
                <Route
                  path="/local/step1"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Step1Config />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/local/step2"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Step2Labeling />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/local/step3"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Step3Export />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;