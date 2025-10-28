
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './common/Icon';

interface FileUploadProps {
  onFileUpload: (files: FileList) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
  }, [onFileUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-300 ${
        isDragging
          ? 'border-brand-yellow-dark bg-brand-yellow-light dark:bg-gray-700'
          : 'border-gray-300 dark:border-gray-600 hover:border-brand-yellow-dark dark:hover:border-brand-yellow'
      }`}
    >
      <input
        id="file-upload"
        type="file"
        multiple
        accept=".xml"
        className="hidden"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload" className="flex flex-col items-center space-y-4 cursor-pointer">
        <UploadIcon className="w-12 h-12 text-gray-400" />
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Arraste e solte seus arquivos .XML aqui
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">ou</p>
        <span className="bg-brand-yellow hover:bg-brand-yellow-dark text-white font-bold py-2 px-4 rounded-lg">
          Selecione os arquivos
        </span>
      </label>
    </div>
  );
};

export default FileUpload;
