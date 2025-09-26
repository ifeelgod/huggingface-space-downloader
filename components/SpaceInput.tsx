import React from 'react';

interface SpaceInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  token: string;
  onTokenChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const SpaceInput: React.FC<SpaceInputProps> = ({ value, onChange, token, onTokenChange, onSubmit, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="space-id" className="block text-sm font-medium text-gray-300 mb-2">
          Hugging Face Space ID or URL
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="space-id"
            type="text"
            value={value}
            onChange={onChange}
            placeholder="e.g., gradio/hello_world"
            className="flex-grow w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-hf-yellow focus:border-hf-yellow transition duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center px-6 py-3 bg-hf-yellow text-gray-900 font-bold rounded-lg hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-hf-yellow disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fetching...
              </>
            ) : (
              'Fetch Files'
            )}
          </button>
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="hf-token" className="block text-sm font-medium text-gray-300 mb-2">
          Hugging Face Token <span className="text-gray-500">(optional, for private spaces)</span>
        </label>
        <input
          id="hf-token"
          type="password"
          value={token}
          onChange={onTokenChange}
          placeholder="hf_..."
          className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-hf-yellow focus:border-hf-yellow transition duration-200"
          disabled={isLoading}
        />
      </div>
    </form>
  );
};

export default SpaceInput;