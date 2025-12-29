// src/context/ProjectContext.jsx
import React, { createContext, useState, useContext } from 'react';

const ProjectContext = createContext();

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [config, setConfig] = useState({
    fileType: 'image', // image, video, audio, csv
    templateQuestions: [], // Các câu hỏi mẫu định nghĩa
  });

  const [dataItems, setDataItems] = useState([]);

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
        setDataItems,
        addDataItems,
        updateDataItem,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};