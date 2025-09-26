import React, { useState } from 'react';
import { HfFile } from '../types';
import FileItem from './FileItem';

// This is a global variable from the script tag in index.html
declare var JSZip: any;

interface FileListProps {
  files: HfFile[];
  spaceId: string;
  token: string;
  isPrivate: boolean;
}

const ZipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1H5V4zM5 7h10v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7z" />
        <path d="M9 9a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1H9z" />
    </svg>
);

const FileList: React.FC<FileListProps> = ({ files, spaceId, token, isPrivate }) => {
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState('');

  const handleDownloadAll = async () => {
    setIsZipping(true);
    setZipProgress('Initializing...');
    
    const zip = new JSZip();

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progressMsg = `[${i + 1}/${files.length}] Downloading ${file.rfilename}`;
        console.log(progressMsg);
        setZipProgress(progressMsg);
        
        const downloadUrl = `https://huggingface.co/spaces/${spaceId}/resolve/main/${file.rfilename}`;
        const headers: HeadersInit = {};
        // Only send the token for private spaces to avoid CORS/redirect issues on public ones.
        if (token && isPrivate) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(downloadUrl, { headers });
        if (!response.ok) {
          console.warn(`Skipping file ${file.rfilename} due to fetch error: ${response.statusText}`);
          continue; // Skip failed files
        }
        const blob = await response.blob();
        zip.file(file.rfilename, blob);
      }

      setZipProgress('Compressing files...');
      const content = await zip.generateAsync({ type: 'blob' });
      
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const repoName = spaceId.split('/').pop() || 'space';
      a.download = `${repoName}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("ZIP creation failed:", error);
      setZipProgress('Error creating ZIP. Check console.');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Show error for 3s
    } finally {
      setIsZipping(false);
      setZipProgress('');
    }
  };


  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-200 truncate">
          Files in <span className="text-hf-yellow font-mono">{spaceId}</span>
        </h3>
        <button
          onClick={handleDownloadAll}
          disabled={isZipping || files.length === 0}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-900 bg-hf-yellow rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-hf-yellow disabled:bg-gray-600 disabled:cursor-not-allowed whitespace-nowrap transition-colors duration-200"
        >
          {isZipping ? (
             zipProgress 
          ) : (
            <>
              <ZipIcon />
              Download All (.zip)
            </>
          )}
        </button>
      </div>
      <div className="divide-y divide-gray-700 bg-gray-900/50">
        {files.map((file) => (
          <FileItem key={file.rfilename} file={file} spaceId={spaceId} token={token} isPrivate={isPrivate} />
        ))}
      </div>
    </div>
  );
};

export default FileList;