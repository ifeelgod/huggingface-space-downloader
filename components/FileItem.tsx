import React, { useState } from 'react';
import { HfFile } from '../types';
import { formatBytes } from '../utils/formatters';

interface FileItemProps {
  file: HfFile;
  spaceId: string;
  token: string;
  isPrivate: boolean;
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const FileItem: React.FC<FileItemProps> = ({ file, spaceId, token, isPrivate }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
        const downloadUrl = `https://huggingface.co/spaces/${spaceId}/resolve/main/${file.rfilename}`;
        const headers: HeadersInit = {};
        // Only send the token for private spaces to avoid CORS/redirect issues on public ones.
        if (token && isPrivate) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(downloadUrl, { headers });
        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = file.rfilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (error) {
        console.error("Download failed:", error);
        alert(`Failed to download ${file.rfilename}. This can happen with private spaces due to API limitations. Check the console for details.`);
    } finally {
        setIsDownloading(false);
    }
  };


  return (
    <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/60 transition-colors duration-200">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 truncate font-mono" title={file.rfilename}>
          {file.rfilename}
        </p>
        <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
      </div>
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="ml-4 w-28 text-center inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-900 bg-gray-300 rounded-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-wait"
        title={`Download ${file.rfilename}`}
      >
        {isDownloading ? (
            <>
                <SpinnerIcon />
                Downloading
            </>
        ) : (
            <>
                <DownloadIcon />
                Download
            </>
        )}
      </button>
    </div>
  );
};

export default FileItem;