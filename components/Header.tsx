import React from 'react';

const Header: React.FC = () => (
  <header className="text-center">
    <div className="inline-flex items-center gap-3">
        <img src="https://huggingface.co/front/assets/huggingface_logo-noborder.svg" alt="Hugging Face Logo" className="w-12 h-12"/>
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
        Space Downloader
        </h1>
    </div>
    <p className="mt-3 text-lg text-gray-400">
      Browse and download files from any public or private Hugging Face Space.
    </p>
  </header>
);

export default Header;