import React, { useState, useCallback } from 'react';
import { HfFile } from './types';
import { fetchSpaceFiles } from './services/huggingFaceService';
import Header from './components/Header';
import SpaceInput from './components/SpaceInput';
import FileList from './components/FileList';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [spaceId, setSpaceId] = useState<string>('ifeelgod/gbprescueaudit');
  const [hfToken, setHfToken] = useState<string>('');
  const [files, setFiles] = useState<HfFile[]>([]);
  const [currentRepo, setCurrentRepo] = useState<string>('');
  const [isPrivateSpace, setIsPrivateSpace] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchFiles = useCallback(async () => {
    if (!spaceId) {
      setError('Please enter a Hugging Face Space ID.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFiles([]);
    setCurrentRepo('');
    setIsPrivateSpace(false);

    try {
      const data = await fetchSpaceFiles(spaceId, hfToken);
      // Filter out directories and .gitattributes, etc.
      const validFiles = data.siblings.filter(file => !file.rfilename.endsWith('/') && file.rfilename !== '.gitattributes');
      setFiles(validFiles);
      setCurrentRepo(data.id);
      setIsPrivateSpace(data.private);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [spaceId, hfToken]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8">
            <SpaceInput 
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              token={hfToken}
              onTokenChange={(e) => setHfToken(e.target.value)}
              onSubmit={handleFetchFiles}
              isLoading={isLoading}
            />

            {isLoading && (
              <div className="flex justify-center mt-8">
                <Loader />
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-left whitespace-pre-wrap">
                <p>{error}</p>
              </div>
            )}

            {!isLoading && files.length > 0 && currentRepo && (
              <div className="mt-8">
                <FileList files={files} spaceId={currentRepo} token={hfToken} isPrivate={isPrivateSpace} />
              </div>
            )}

            {!isLoading && files.length === 0 && currentRepo && !error && (
                <div className="mt-6 bg-gray-700/50 border border-gray-600 text-gray-400 px-4 py-3 rounded-lg text-center">
                    <p>No downloadable files found in this space.</p>
                </div>
            )}
          </div>
        </main>
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Powered by the Hugging Face Hub API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;