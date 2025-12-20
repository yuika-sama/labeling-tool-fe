// src/context/ProjectContext.jsx
import React, { createContext, useState, useContext } from 'react';

const ProjectContext = createContext();

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  // State cho Trang 1
  const [config, setConfig] = useState({
    fileType: 'image', // image, video, audio, csv
    templateQuestions: [], // Các câu hỏi mẫu định nghĩa ở trang 1
  });

  // State cho Trang 2 (Danh sách các item đã upload và gán nhãn)
  const [dataItems, setDataItems] = useState([]);

  // Hàm reset hoặc cập nhật config
  const updateConfig = (newConfig) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Hàm thêm file vào danh sách items
  const addDataItems = (newItems) => {
    setDataItems((prev) => [...prev, ...newItems]);
  };

  // Hàm cập nhật nội dung của 1 item cụ thể (sửa câu trả lời, thêm câu hỏi riêng)
  const updateDataItem = (id, updatedFields) => {
    setDataItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  return (
    <ProjectContext.Provider
      value={{
        config,
        updateConfig,
        dataItems,
        setDataItems, // Cần dùng để reset hoặc set lại
        addDataItems,
        updateDataItem,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};